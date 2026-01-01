
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function getUserOrders() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        const orders = await prisma.order.findMany({
            where: { userId: session.user.id },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                name_en: true,
                                images: true,
                                slug: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Format for frontend
        return orders.map(order => ({
            id: order.id,
            displayId: order.orderNumber ? `#${order.orderNumber.slice(-6)}` : `#${order.id.slice(-6)}`,
            date: new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            status: order.status,
            total: Number(order.total),
            items: order.items.map(item => {
                let imageUrl = '/placeholder.png';
                try {
                    const images = item.product?.images ? JSON.parse(item.product.images) : [];
                    if (images.length > 0) imageUrl = images[0];
                } catch (e) { }

                return {
                    name: item.product?.name_en || 'Product Deleted',
                    quantity: item.quantity,
                    price: Number(item.price),
                    image: imageUrl,
                    slug: item.product?.slug
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
        await prisma.user.update({
            where: { id: session.user.id },
            data: { name }
        });

        // revalidatePath('/account'); // Might not update session immediately
        return { success: true };
    } catch (error) {
        console.error('Failed to update profile:', error);
        return { error: 'Failed to update profile' };
    }
}
