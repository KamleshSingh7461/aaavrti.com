
'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import { Address } from '@/lib/models/User';
import { Product } from '@/lib/models/Product';
import { Order } from '@/lib/models/Order';
import { revalidatePath } from 'next/cache';
import { validateCoupon } from '@/actions/offer-actions';
import { calculatePricing } from '@/lib/pricing';
import { getAttributionFromCookies } from '@/lib/utm-tracker';
import { headers } from 'next/headers';
import mongoose from 'mongoose';

import { ShiprocketService } from '@/lib/services/shiprocket';

export async function verifyPincode(pincode: string) {
    try {
        // 1. Check Serviceability via Shiprocket
        const service = new ShiprocketService();
        // Auth handled internally
        const serviceResult = await service.checkServiceability(pincode);
        let etd = '';

        // Strict Check: Ensure couriers are available
        const couriers = serviceResult?.data?.available_courier_companies || [];
        const isServiceable = couriers.length > 0;

        if (isServiceable) {
            // Get ETD from the first/best courier
            etd = couriers[0].etd; // usually string date '2025-01-05'
        }

        // 2. Fetch City/State details
        let city = '';
        let state = '';
        try {
            const geoRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const geoData = await geoRes.json();
            if (geoData?.[0]?.Status === 'Success') {
                const details = geoData[0].PostOffice[0];
                city = details.District;
                state = details.State;
            }
        } catch (e) {
            console.error('Failed to fetch city/state:', e);
        }

        return {
            success: isServiceable && !!city, // Strict success only if serviceable AND valid pincode
            data: serviceResult,
            city,
            state,
            etd
        };
    } catch (error: any) {
        console.error('Pincode verification failed:', error);
        return { error: error.message || 'Failed to verify pincode' };
    }
}

export async function getAddresses() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        await dbConnect();
        const addresses = await Address.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .lean();

        return addresses.map((addr: any) => ({ ...addr, id: addr._id.toString() }));
    } catch (error) {
        console.error('Failed to fetch addresses:', error);
        return [];
    }
}

export async function saveAddress(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const street = formData.get('street') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const postalCode = formData.get('postalCode') as string;
    const houseNo = formData.get('houseNo') as string;
    const landmark = formData.get('landmark') as string;
    const phone = formData.get('phone') as string;

    if (!name || !street || !city || !state || !postalCode || !phone || !houseNo) {
        return { error: 'Missing required fields' };
    }

    try {
        await dbConnect();
        const newAddress = await Address.create({
            userId: session.user.id,
            name,
            street,
            city,
            state,
            postalCode,
            houseNo,
            landmark,
            phone,
            country: 'IN', // Hardcoded for now
            type: 'SHIPPING'
        });

        const address = newAddress.toObject();
        address.id = address._id.toString();

        revalidatePath('/checkout');
        return { success: true, address };
    } catch (error) {
        console.error('Failed to save address:', error);
        return { error: 'Failed to save address' };
    }
}

export async function updateAddress(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const street = formData.get('street') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const postalCode = formData.get('postalCode') as string;
    const houseNo = formData.get('houseNo') as string;
    const landmark = formData.get('landmark') as string;
    const phone = formData.get('phone') as string;

    if (!id || !name || !street || !city || !state || !postalCode || !phone || !houseNo) {
        return { error: 'Missing required fields' };
    }

    try {
        await dbConnect();
        // Verify ownership
        const existing = await Address.findById(id);
        if (!existing || existing.userId.toString() !== session.user.id) {
            return { error: 'Address not found' };
        }

        const updated = await Address.findByIdAndUpdate(id, {
            name, street, city, state, postalCode, phone, houseNo, landmark
        }, { new: true }).lean();

        const address = { ...updated, id: updated._id.toString() };

        revalidatePath('/checkout');
        revalidatePath('/account/addresses');
        return { success: true, address };
    } catch (error) {
        console.error('Failed to update address:', error);
        return { error: 'Failed to update address' };
    }
}

export async function deleteAddress(addressId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    try {
        await dbConnect();
        const existing = await Address.findById(addressId);
        if (!existing || existing.userId.toString() !== session.user.id) {
            return { error: 'Address not found' };
        }

        await Address.findByIdAndDelete(addressId);

        revalidatePath('/checkout');
        revalidatePath('/account/addresses');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete address:', error);
        return { error: 'Failed to delete address' };
    }
}

interface CartItem {
    id: string; // Product or Variant ID
    productId: string; // Base Product ID
    quantity: number;
    price: number;
    attributes?: Record<string, string>;
    variantId?: string; // Explicit variant ID if available
}

export async function createOrder(items: CartItem[], addressId: string, paymentMethod: 'COD' | 'ONLINE', couponCode?: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    if (!items.length) return { error: 'Cart is empty' };
    if (!addressId) return { error: 'Shipping address is required' };

    const sessionTransaction = await mongoose.startSession();
    sessionTransaction.startTransaction();

    try {
        await dbConnect();

        // 1. Validate Stock & Calculate Prices
        const realItems = [];

        for (const item of items) {
            const productId = item.productId || item.id;

            let query: any = { _id: productId };
            if (mongoose.isValidObjectId(productId)) {
                query = { $or: [{ _id: productId }, { _id: new mongoose.Types.ObjectId(productId) }] };
            }
            const product = await Product.findOne(query).session(sessionTransaction);

            if (!product) throw new Error(`Product not found: ${item.id}`);

            let unitPrice = Number(product.price);

            // Handle Variants
            if (product.variants && product.variants.length > 0) {
                // variants stored as Mixed/Array
                const variants = product.variants;
                const variant = variants.find((v: any) => v.id === item.id);

                if (variant) {
                    unitPrice = Number(variant.price);
                    if ((variant.stock || 0) < item.quantity) {
                        throw new Error(`Insufficient stock for ${product.name_en} (${variant.name})`);
                    }
                } else {
                    throw new Error(`Variant not available: ${item.id}`);
                }
            } else {
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name_en}`);
                }
            }

            realItems.push({
                id: item.id,
                productId: product._id.toString(),
                price: unitPrice,
                quantity: item.quantity,
                attributes: item.attributes
            });
        }

        // 2. Calculate Totals & Discounts
        let finalSubtotal = 0;
        let discountTotal = 0;
        let finalTotal = 0;
        let itemsWithDiscount: any[] = [];

        if (couponCode) {
            const result = await validateCoupon(couponCode, realItems);
            if (result.error) throw new Error(result.error);

            finalSubtotal = result.subtotal!;
            discountTotal = result.discountTotal!;
            finalTotal = result.finalTotal!;

            const totalVal = realItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
            itemsWithDiscount = realItems.map(item => {
                const itemTotal = item.price * item.quantity;
                const share = totalVal > 0 ? (itemTotal / totalVal) : 0;
                return { ...item, discount: share * discountTotal };
            });
        } else {
            const baseCalc = calculatePricing(realItems);
            itemsWithDiscount = realItems.map(i => ({ ...i, discount: 0 }));
            finalSubtotal = baseCalc.subtotal;
            finalTotal = baseCalc.subtotal;
        }

        // 3. DECREMENT STOCK
        for (const item of realItems) {
            let query: any = { _id: item.productId };
            if (mongoose.isValidObjectId(item.productId)) {
                query = { $or: [{ _id: item.productId }, { _id: new mongoose.Types.ObjectId(item.productId) }] };
            }
            const product = await Product.findOne(query).session(sessionTransaction);
            if (!product) throw new Error("Product unavailable");

            if (product.variants && product.variants.length > 0) {
                // Update Variant Stock
                let variants = product.variants;
                const variantIndex = variants.findIndex((v: any) => v.id === item.id);
                if (variantIndex !== -1) {
                    const currentStock = variants[variantIndex].stock || 0;
                    if (currentStock < item.quantity) {
                        throw new Error(`Sold out: ${product.name_en} (${variants[variantIndex].name})`);
                    }

                    variants[variantIndex].stock -= item.quantity;
                    const newTotalStock = variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);

                    // Mark as modified because it's Mixed type often
                    product.markModified('variants');
                    product.stock = newTotalStock;
                    await product.save({ session: sessionTransaction });
                }
            } else {
                // Atomic Decrement for simple products
                const updateResult = await Product.updateOne(
                    {
                        _id: item.productId,
                        stock: { $gte: item.quantity }
                    },
                    { $inc: { stock: -item.quantity } }
                ).session(sessionTransaction);

                if (updateResult.modifiedCount === 0) {
                    throw new Error(`Sold out: ${product.name_en}`);
                }
            }
        }

        // 4. Capture Marketing Attribution
        const headersList = await headers();
        const cookieHeader = headersList.get('cookie');
        const attribution = getAttributionFromCookies(cookieHeader);

        // Get coupon ID if coupon was applied
        let couponId: string | undefined;
        if (couponCode) {
            const couponResult = await validateCoupon(couponCode, realItems);
            if (couponResult.success && couponResult.couponId) {
                couponId = couponResult.couponId;
            }
        }

        // 5. Create Order
        const order = await Order.create([{
            userId: session.user.id,
            shippingAddressId: addressId,
            billingAddressId: addressId,
            subtotal: finalSubtotal,
            tax: 0,
            shippingCost: 0,
            total: finalTotal,
            couponCode: couponCode || null,
            discountTotal: discountTotal,
            status: 'PENDING',
            paymentProtocol: paymentMethod === 'COD' ? 'COD' : 'RAZORPAY_INIT',
            paymentData: JSON.stringify({ method: paymentMethod }),
            // Marketing Attribution
            source: attribution?.source || null,
            medium: attribution?.medium || null,
            campaign: attribution?.campaign || null,
            utmSource: attribution?.utmSource || null,
            utmMedium: attribution?.utmMedium || null,
            utmCampaign: attribution?.utmCampaign || null,
            utmContent: attribution?.utmContent || null,
            utmTerm: attribution?.utmTerm || null,
            couponId: couponId || null,
            discountAmount: discountTotal,
            items: itemsWithDiscount.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                discount: item.discount || 0,
                attributes: item.attributes // Mongoose Mixed handles object directly usually
            }))
        }], { session: sessionTransaction });

        if (paymentMethod === 'COD') {
            await Order.findByIdAndUpdate(order[0]._id, { status: 'CONFIRMED' }, { session: sessionTransaction });
        }

        await sessionTransaction.commitTransaction();
        sessionTransaction.endSession();

        // Send Email (Fire and forget-ish, or await)
        // Since we are in a server action, awaiting is safer.
        await sendOrderEmail(order[0]._id.toString());

        return { success: true, orderId: order[0]._id.toString(), total: Number(finalTotal), paymentMethod };

    } catch (error: any) {
        await sessionTransaction.abortTransaction();
        sessionTransaction.endSession();
        console.error('Order creation failed:', error);
        return { error: error.message || 'Failed to create order' };
    }
}

// Separate function to send email asynchronously so it doesn't block the order response significantly
// or ideally use after checks. But server actions are awaited.
// We can fire and forget if looking for speed, but Next.js serverless might kill it. 
// Safer to await or use waitUntil (if Vercel/Next supports).
// Let's await it to be sure.

export async function sendOrderEmail(orderId: string) {
    try {
        const { sendEmail } = await import('@/lib/email-service');
        const { orderConfirmationTemplate } = await import('@/lib/email-templates');

        await dbConnect();
        const order = await Order.findById(orderId).populate('shippingAddressId');
        if (!order) return;

        // Populate product names for template (order.items has productId, populate it)
        // Wait, items in Order schema might be using productId ref.
        // Let's populate deeply if needed or just use what we have.
        // The template expects array of { name, quantity, price }

        // We need to fetch product names because they might not be fully embedded if schema is just ID
        // Schema checks: items: [{ productId: ..., quantity: ..., price: ... }]
        // We need to look up names.

        const enrichedItems = await Promise.all(order.items.map(async (item: any) => {
            const p = await Product.findById(item.productId).select('name_en');
            return {
                name: p?.name_en || 'Product',
                quantity: item.quantity,
                price: item.price
            };
        }));

        const toSend = {
            id: order._id.toString(),
            orderNumber: order._id.toString().slice(-6).toUpperCase(),
            createdAt: order.createdAt,
            customerName: 'Customer', // We might need to fetch User name or use Address name
            subtotal: order.subtotal,
            total: order.total,
            discount: order.discountTotal,
            shippingAddress: order.shippingAddressId, // Populated
            items: enrichedItems
        };

        // Fetch user name if available
        const User = mongoose.models.User;
        const user = await User.findById(order.userId);
        if (user) toSend.customerName = user.name;

        await sendEmail({
            to: user?.email || 'kamlesh7461@gmail.com',
            subject: `Order Confirmed #${toSend.orderNumber}`,
            html: orderConfirmationTemplate(toSend),
            category: 'ORDER'
        });

    } catch (e) {
        console.error("Failed to send order email", e);
    }
}
