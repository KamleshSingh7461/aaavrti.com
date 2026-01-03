import { getOrderById } from '@/actions/order-actions';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Restore Your Cart | Aaavrti',
    description: 'Complete your order',
};

interface RestorePageProps {
    params: Promise<{ orderId: string }>;
}

export default async function RestoreCartPage({ params }: RestorePageProps) {
    const { orderId } = await params;

    // Fetch the order
    const order = await getOrderById(orderId);

    if (!order || order.status !== 'PENDING') {
        notFound();
    }

    // In a real implementation, you would:
    // 1. Restore items to cart (localStorage or session)
    // 2. Redirect to checkout with pre-filled data

    // For now, redirect to checkout page
    // The checkout page should handle restoring the cart from the order
    redirect(`/checkout?restore=${orderId}`);
}
