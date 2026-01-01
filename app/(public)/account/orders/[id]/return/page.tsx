
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { ReturnForm } from '@/components/account/ReturnForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ReturnPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect('/auth/login');

    const { id } = await params;

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: { include: { product: true } }
        }
    });

    if (!order || order.userId !== session.user.id) {
        return <div>Order not found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <Link href={`/account/orders/${order.id}`} className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 text-sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Order
            </Link>

            <h1 className="text-2xl font-serif font-medium mb-2">Request Return</h1>
            <p className="text-muted-foreground mb-8">Select items and provide a reason for your return.</p>

            <ReturnForm order={order} orderId={order.id} />
        </div>
    );
}
