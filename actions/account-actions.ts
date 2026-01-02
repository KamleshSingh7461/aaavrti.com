
'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import { Order } from '@/lib/models/Order';
import { User } from '@/lib/models/User';
import { revalidatePath } from 'next/cache';

export interface DashboardOrder {
    id: string;
    displayId: string;
    date: string;
    status: string;
    total: number;
    items: {
        name: string;
        quantity: number;
        price: number;
        image: string;
        slug: string;
    }[];
    trackingId: string | null;
}

export async function getUserOrders(): Promise<DashboardOrder[]> {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        await dbConnect();
        const orders = await Order.find({ userId: session.user.id })
            .populate({
                path: 'items.productId',
                select: 'name_en images slug'
            })
            .sort({ createdAt: -1 })
            .lean();

        // Format for frontend
        return orders.map((order: any) => ({
            id: order._id.toString(),
            displayId: order.orderNumber ? `#${order.orderNumber.slice(-6)}` : `#${order._id.toString().slice(-6)}`,
            date: new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            status: order.status,
            total: Number(order.total),
            items: (order.items || []).map((item: any) => {
                let imageUrl = '/placeholder.png';
                // Handle different product structures (populated)
                const product = item.productId;
                if (!product) {
                    return {
                        name: 'Product Deleted',
                        quantity: item.quantity,
                        price: Number(item.price),
                        image: imageUrl,
                        slug: '#'
                    };
                }

                try {
                    // Check if images is array or string
                    if (Array.isArray(product.images) && product.images.length > 0) {
                        imageUrl = product.images[0];
                    } else if (typeof product.images === 'string') {
                        const images = JSON.parse(product.images);
                        if (images.length > 0) imageUrl = images[0];
                    }
                } catch (e) { }

                return {
                    name: product.name_en || 'Unknown Product',
                    quantity: item.quantity,
                    price: Number(item.price),
                    image: imageUrl,
                    slug: product.slug
                }
            }),
            trackingId: order.shippingData ? (() => { try { return JSON.parse(order.shippingData).trackingId } catch (e) { return null } })() : null
        }));

    } catch (error) {
        console.error('Failed to fetch user orders:', error);
        return [];
    }
}

export async function updateUserProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { error: 'Unauthorized' };

    const name = formData.get('name') as string;

    if (!name || name.length < 2) {
        return { error: 'Name must be at least 2 characters long' };
    }

    try {
        await dbConnect();
        await User.findByIdAndUpdate(session.user.id, { name });

        // revalidatePath('/account'); // Might not update session immediately
        return { success: true };
    } catch (error) {
        console.error('Failed to update profile:', error);
        return { error: 'Failed to update profile' };
    }
}
