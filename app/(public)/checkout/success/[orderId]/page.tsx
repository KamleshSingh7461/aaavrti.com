import Link from 'next/link';
import { CheckCircle, ArrowRight, Package, MapPin, ExternalLink } from 'lucide-react';
import { getOrderById } from '@/actions/order-actions';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/utils';

export default async function OrderSuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = await params;
    const order = await getOrderById(orderId);

    if (!order) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-card p-8 rounded-2xl border border-border text-center">
                    <h1 className="text-xl font-semibold mb-2">Order not found</h1>
                    <p className="text-muted-foreground mb-4">We couldn't find the order you're looking for.</p>
                    <Link href="/" className="text-primary hover:underline">Return Home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12">
            <div className="max-w-xl w-full bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="bg-primary/5 p-8 text-center border-b border-border">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-6 shadow-sm">
                        <CheckCircle className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl font-serif font-medium mb-2">Order Confirmed!</h1>
                    <p className="text-muted-foreground">
                        Thank you, {order.shippingAddress?.name?.split(' ')[0] || 'valued customer'}.<br />
                        Your order has been placed successfully.
                    </p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Order Details Grid */}
                    <div className="grid grid-cols-2 gap-6 text-sm">
                        <div className="space-y-1">
                            <span className="text-muted-foreground">Order Number</span>
                            <p className="font-mono font-medium text-lg text-primary">#{order.orderNumber}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <span className="text-muted-foreground">Total Amount</span>
                            <p className="font-semibold text-lg">₹{order.total.toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    <div className="bg-secondary/20 rounded-xl p-5 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-background p-2 rounded-full border border-border shrink-0">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Shipping to:</p>
                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                    {order.shippingAddress?.name}<br />
                                    {order.shippingAddress?.street}, {order.shippingAddress?.city}<br />
                                    {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 pt-4 border-t border-border/50">
                            <div className="bg-background p-2 rounded-full border border-border shrink-0">
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Estimated Delivery:</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    5 - 7 Business Days
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Link
                            href="/products"
                            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground h-12 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
                        >
                            Continue Shopping <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href={`/account/orders/${order.id}`}
                            className="flex items-center justify-center gap-2 px-6 h-12 rounded-lg font-medium border border-border hover:bg-secondary transition-all"
                        >
                            View Order <ExternalLink className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
