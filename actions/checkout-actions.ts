
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { validateCoupon } from '@/actions/offer-actions';
import { calculatePricing } from '@/lib/pricing';
import { getAttributionFromCookies } from '@/lib/utm-tracker';
import { headers } from 'next/headers';

export async function getAddresses() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const addresses = await prisma.address.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        });
        return addresses;
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
    const phone = formData.get('phone') as string;

    if (!name || !street || !city || !state || !postalCode || !phone) {
        return { error: 'Missing required fields' };
    }

    try {
        const address = await prisma.address.create({
            data: {
                userId: session.user.id,
                name,
                street,
                city,
                state,
                postalCode,
                phone,
                country: 'IN', // Hardcoded for now
                type: 'SHIPPING'
            }
        });

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
    const phone = formData.get('phone') as string;

    if (!id || !name || !street || !city || !state || !postalCode || !phone) {
        return { error: 'Missing required fields' };
    }

    try {
        // Verify ownership
        const existing = await prisma.address.findUnique({ where: { id } });
        if (!existing || existing.userId !== session.user.id) {
            return { error: 'Address not found' };
        }

        const address = await prisma.address.update({
            where: { id },
            data: { name, street, city, state, postalCode, phone }
        });

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
        const existing = await prisma.address.findUnique({ where: { id: addressId } });
        if (!existing || existing.userId !== session.user.id) {
            return { error: 'Address not found' };
        }

        await prisma.address.delete({ where: { id: addressId } });

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

    try {
        // WRAP IN TRANSACTION FOR ATOMICITY
        return await prisma.$transaction(async (tx) => {
            // 1. Validate Stock & Calculate Prices (Re-fetch inside TX to get latest lock)
            const realItems = [];

            for (const item of items) {
                const productId = item.productId || item.id;

                // For SQLite/Prisma, this read is part of the transaction.
                const product = await tx.product.findUnique({ where: { id: productId } });

                if (!product) throw new Error(`Product not found: ${item.id}`);

                let unitPrice = Number(product.price);

                // Handle Variants
                if (product.variants) {
                    const variants = JSON.parse(product.variants as string);
                    const variant = variants.find((v: any) => v.id === item.id);

                    if (variant) {
                        unitPrice = Number(variant.price);
                        if ((variant.stock || 0) < item.quantity) {
                            throw new Error(`Insufficient stock for ${product.name_en} (${variant.name})`);
                        }
                    } else {
                        // Variant missing logic? Skip or throw?
                        // If user ordered a variant that doesn't exist, throw.
                        throw new Error(`Variant not available: ${item.id}`);
                    }
                } else {
                    if (product.stock < item.quantity) {
                        throw new Error(`Insufficient stock for ${product.name_en}`);
                    }
                }

                realItems.push({
                    id: item.id,
                    productId: product.id,
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
                // Determine coupon validity (Note: validateCoupon uses 'prisma', outside tx? 
                // ideally pass tx, but validateCoupon is imported. For now assume coupon rules don't race much)
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

            // 3. DECREMENT STOCK (The Critical Step)
            for (const item of realItems) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product) throw new Error("Product unavailable"); // Should catch above, but safety

                if (product.variants) {
                    // Update JSON Variant Stock
                    let variants = JSON.parse(product.variants as string);
                    const variantIndex = variants.findIndex((v: any) => v.id === item.id);
                    if (variantIndex !== -1) {
                        // Double check inside lock
                        const currentStock = variants[variantIndex].stock || 0;
                        if (currentStock < item.quantity) {
                            throw new Error(`Sold out: ${product.name_en} (${variants[variantIndex].name})`);
                        }

                        variants[variantIndex].stock -= item.quantity;
                        const newTotalStock = variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);

                        await tx.product.update({
                            where: { id: item.productId },
                            data: { variants: JSON.stringify(variants), stock: newTotalStock }
                        });
                    }
                } else {
                    // Atomic Decrement for simple products
                    // We use updateMany to ensure we only update if stock >= quantity
                    const updateResult = await tx.product.updateMany({
                        where: {
                            id: item.productId,
                            stock: { gte: item.quantity }
                        },
                        data: { stock: { decrement: item.quantity } }
                    });

                    if (updateResult.count === 0) {
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

            // 5. Create Order (INITIAL: PENDING) with Attribution
            const order = await tx.order.create({
                data: {
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
                    items: {
                        create: itemsWithDiscount.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            discount: item.discount || 0,
                            attributes: JSON.stringify(item.attributes || {})
                        }))
                    }
                }
            });

            // 6. If COD, Confirm immediately
            if (paymentMethod === 'COD') {
                await tx.order.update({
                    where: { id: order.id },
                    data: { status: 'CONFIRMED' }
                });
            }

            return { success: true, orderId: order.id, total: Number(finalTotal), paymentMethod };
        });

    } catch (error: any) {
        console.error('Order creation failed:', error);
        return { error: error.message || 'Failed to create order' };
    }
}
