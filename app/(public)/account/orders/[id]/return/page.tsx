
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import { Order } from '@/lib/models/Order';
import { redirect } from 'next/navigation';
import { ReturnForm } from '@/components/account/ReturnForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ReturnPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect('/auth/login');

    const { id } = await params;

    await dbConnect();

    // Find Order
    const order = await Order.findById(id).lean();

    if (!order || order.userId !== session.user.id) {
        return <div>Order not found or unauthorized</div>;
    }

    // Transform order items for compatibility (ids to string)
    const items = (order.items || []).map((item: any) => ({
        ...item,
        id: item._id ? item._id.toString() : item.id, // Ensure we have id
        orderItemId: item._id ? item._id.toString() : item.id,
        // Since we are not populating product here (ReturnForm might need it?), 
        // Component expects `{ items: { product: ... } }`?
        // Let's check `ReturnForm`. The view in step 249 showed items include product.
        // We should populate product.
    }));

    // Re-fetch with population
    const orderWithProducts = await Order.findById(id)
        .populate('items.product') // Note: if items is embedded schema array, we can populate deep
        .lean();

    // Wait, `items` in Mongoose schema was array of subdocuments.
    // In `Order.ts`, `items` schema has `product: { type: Schema.Types.ObjectId, ref: 'Product' }`.
    // So populate works.

    // Need to serialize for client component
    const serializedOrder = {
        ...orderWithProducts,
        id: orderWithProducts._id.toString(),
        items: orderWithProducts.items.map((item: any) => ({
            ...item,
            id: item._id.toString(), // or return `orderItemId`
            orderItemId: item._id.toString(),
            product: item.product ? { ...item.product, id: item.product._id.toString() } : null
        }))
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <Link href={`/account/orders/${order._id.toString()}`} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 text-sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Order
            </Link>

            <h1 className="text-2xl font-serif font-medium mb-2">Request Return</h1>
            <p className="text-muted-foreground mb-8">Select items and provide a reason for your return.</p>

            <ReturnForm order={serializedOrder} orderId={serializedOrder.id} />
        </div>
    );
}
