import { auth } from '@/auth';
import { getUserOrders } from '@/actions/account-actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Cormorant_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Package, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

export const metadata = {
    title: 'My Orders | Account',
    description: 'View and track your past orders.'
};

export default async function OrdersPage() {
    const session = await auth();
    if (!session?.user) redirect('/auth/login');

    const orders = await getUserOrders();

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                <div className="h-24 w-24 bg-secondary/30 rounded-full flex items-center justify-center">
                    <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <h1 className={cn("text-3xl font-medium", cormorant.className)}>No Orders Yet</h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        You haven't placed any orders with us yet. Discover our collection and find something you love.
                    </p>
                </div>
                <Link
                    href="/products"
                    className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-border/40 pb-6">
                <h1 className={cn("text-3xl font-serif font-medium", cormorant.className)}>My Orders</h1>
                <span className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                    {orders.length} Order{orders.length !== 1 ? 's' : ''}
                </span>
            </div>

            <StaggerContainer className="space-y-4">
                {orders.map((order) => (
                    <StaggerItem key={order.id}>
                        <Link
                            href={`/account/orders/${order.id}`}
                            className="group block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all shadow-sm hover:shadow-md"
                        >
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-lg">{order.displayId}</span>
                                            <span className={cn(
                                                "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                                order.status === 'DELIVERED' ? "bg-green-50 text-green-700 border-green-200" :
                                                    order.status === 'CONFIRMED' ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                        order.status === 'CANCELLED' ? "bg-red-50 text-red-700 border-red-200" :
                                                            "bg-secondary text-secondary-foreground border-border"
                                            )}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                                            <Clock className="h-3.5 w-3.5" />
                                            {order.date}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Total Amount</p>
                                        <p className="text-lg font-medium">₹{order.total.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        {/* Product Images Preview */}
                                        <div className="flex -space-x-2">
                                            {order.items.slice(0, 4).map((item, i) => (
                                                <div key={i} className="relative h-10 w-10 rounded-full border-2 border-background overflow-hidden bg-secondary">
                                                    {item.image ? (
                                                        <Image
                                                            src={item.image}
                                                            alt={item.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">IMG</div>
                                                    )}
                                                </div>
                                            ))}
                                            {order.items.length > 4 && (
                                                <div className="h-10 w-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground">
                                                    +{order.items.length - 4}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-sm text-muted-foreground pl-2">
                                            {order.items.length} Item{order.items.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    <div className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                                        View Details <ChevronRight className="h-4 w-4 ml-1" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </StaggerItem>
                ))}
            </StaggerContainer>
        </div>
    );
}
