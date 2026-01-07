import { Metadata } from 'next';
import { getOrderById } from '@/actions/order-actions';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Package, Truck, CheckCircle2, XCircle, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Track Your Order | Ournika',
    description: 'Track your order status and delivery information',
};

interface TrackPageProps {
    searchParams: Promise<{ order?: string }>;
}

export default async function TrackPage({ searchParams }: TrackPageProps) {
    const params = await searchParams;
    const orderNumber = params.order;

    if (!orderNumber) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-20">
                    <div className="max-w-md mx-auto">
                        <h1 className="text-3xl font-serif mb-8">Track Your Order</h1>
                        <form action="/track-order" method="get" className="space-y-4">
                            <div>
                                <label htmlFor="order" className="block text-sm font-medium mb-2">
                                    Order Number
                                </label>
                                <input
                                    type="text"
                                    id="order"
                                    name="order"
                                    placeholder="Enter your order number"
                                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                            >
                                Track Order
                            </button>
                        </form>
                        <p className="text-sm text-muted-foreground mt-4">
                            You can find your order number in the confirmation email we sent you.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Fetch order
    const order = await getOrderById(orderNumber);

    if (!order) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-20">
                    <div className="max-w-md mx-auto text-center">
                        <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                        <h1 className="text-2xl font-serif mb-4">Order Not Found</h1>
                        <p className="text-muted-foreground mb-8">
                            We couldn't find an order with number: <strong>{orderNumber}</strong>
                        </p>
                        <Link
                            href="/track-order"
                            className="inline-flex items-center text-primary hover:underline"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Try again
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Parse shipping data
    let trackingInfo: any = null;
    try {
        if (order.shippingData) {
            trackingInfo = typeof order.shippingData === 'string'
                ? JSON.parse(order.shippingData)
                : order.shippingData;
        }
    } catch (e) {
        console.error('Failed to parse shipping data:', e);
    }

    // Status timeline
    const statusSteps = [
        { status: 'PENDING', label: 'Order Placed', icon: Package, completed: true },
        { status: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2, completed: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) },
        { status: 'PROCESSING', label: 'Processing', icon: Clock, completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status) },
        { status: 'SHIPPED', label: 'Shipped', icon: Truck, completed: ['SHIPPED', 'DELIVERED'].includes(order.status) },
        { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle2, completed: order.status === 'DELIVERED' },
    ];

    const isCancelled = order.status === 'CANCELLED';

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 lg:py-20">
                <Link
                    href="/track-order"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Track another order
                </Link>

                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-3xl font-serif mb-2">Order Tracking</h1>
                        <p className="text-muted-foreground">
                            Order #{order.orderNumber} • Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    {/* Status Timeline */}
                    {!isCancelled && (
                        <div className="bg-card border border-border rounded-lg p-8 mb-8">
                            <h2 className="text-xl font-semibold mb-8">Order Status</h2>
                            <div className="relative">
                                {/* Progress Line */}
                                <div className="absolute top-6 left-6 right-6 h-0.5 bg-border">
                                    <div
                                        className="h-full bg-primary transition-all duration-500"
                                        style={{
                                            width: `${(statusSteps.filter(s => s.completed).length - 1) / (statusSteps.length - 1) * 100}%`
                                        }}
                                    />
                                </div>

                                {/* Steps */}
                                <div className="relative flex justify-between">
                                    {statusSteps.map((step, index) => {
                                        const Icon = step.icon;
                                        return (
                                            <div key={step.status} className="flex flex-col items-center">
                                                <div
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all ${step.completed
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground'
                                                        }`}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <p className={`text-sm font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {step.label}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cancelled Status */}
                    {isCancelled && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 mb-8">
                            <div className="flex items-center gap-3">
                                <XCircle className="h-6 w-6 text-destructive" />
                                <div>
                                    <h3 className="font-semibold text-destructive">Order Cancelled</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        This order has been cancelled. If you have any questions, please contact support.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tracking Information */}
                    {trackingInfo && trackingInfo.trackingId && (
                        <div className="bg-card border border-border rounded-lg p-6 mb-8">
                            <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Tracking ID</p>
                                        <p className="text-sm text-muted-foreground font-mono">{trackingInfo.trackingId}</p>
                                    </div>
                                </div>
                                {trackingInfo.awbCode && (
                                    <div className="flex items-start gap-3">
                                        <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">AWB Code</p>
                                            <p className="text-sm text-muted-foreground font-mono">{trackingInfo.awbCode}</p>
                                        </div>
                                    </div>
                                )}
                                {trackingInfo.provider && (
                                    <div className="flex items-start gap-3">
                                        <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Courier</p>
                                            <p className="text-sm text-muted-foreground">{trackingInfo.provider}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="bg-card border border-border rounded-lg p-6 mb-8">
                        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item: any, index: number) => (
                                <div key={index} className="flex gap-4">
                                    <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                        {item.image && item.image !== '/placeholder.png' ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                        <p className="text-sm font-medium mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            {order.discountAmount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Discount</span>
                                    <span className="text-green-600">-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            {order.shippingCost > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>₹{order.shippingCost.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span>₹{order.tax.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="border-t border-border pt-2 mt-2">
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>₹{order.total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    {order.shippingAddress && (
                        <div className="bg-card border border-border rounded-lg p-6 mt-8">
                            <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
                            <div className="text-sm space-y-1">
                                <p className="font-medium">{order.shippingAddress.name}</p>
                                <p className="text-muted-foreground">{order.shippingAddress.street}</p>
                                {order.shippingAddress.landmark && (
                                    <p className="text-muted-foreground">Near {order.shippingAddress.landmark}</p>
                                )}
                                <p className="text-muted-foreground">
                                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                                </p>
                                <p className="text-muted-foreground">Phone: {order.shippingAddress.phone}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
