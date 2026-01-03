
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import { Order, ReturnRequest } from '@/lib/models/Order';
import { getOrderById } from '@/actions/order-actions';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock, MapPin, Package, RotateCcw, FileText } from 'lucide-react';

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect('/auth/login');

    const { id } = await params;

    // await dbConnect(); // getOrderById handles connection

    const order = await getOrderById(id);

    if (!order) {
        return (
            <div className="p-12 text-center space-y-2">
                <div className="text-xl font-medium">Order not found</div>
                <p className="text-muted-foreground">ID: {id}</p>
                <div className="text-xs text-red-500">Database returned null.</div>
            </div>
        );
    }

    if (order.userId !== session.user.id) {
        return (
            <div className="p-12 text-center">
                <div className="text-xl">Access Denied</div>
                <p className="text-muted-foreground text-sm">This order belongs to another user.</p>
            </div>
        );
    }

    // Fetch Return Requests separately since they are likely in separate collection (ref: ReturnRequest model)
    // Or if ReturnRequest was embedded? `marketing-actions` refactor suggested ReturnRequest is separate model.
    // In `Marketing.ts`? Or `Order.ts`? I used `ReturnRequest` in `return-actions.ts`.
    // Let's assume separate model.
    // Fetch Return Requests separately
    await dbConnect(); // Ensure connection for ReturnRequest
    const returnRequests = await ReturnRequest.find({ orderId: order.id }).sort({ createdAt: -1 }).lean();

    // Determine if eligible for Return or Cancel
    // Returns: Only DELIVERED orders within 3 days
    const isDelivered = order.status === 'DELIVERED';
    const deliveryDate = order.updatedAt;
    const daysSinceDelivery = Math.floor((Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24));
    const withinReturnWindow = daysSinceDelivery <= 3;
    const noExistingReturn = returnRequests.length === 0;
    const canReturn = isDelivered && withinReturnWindow && noExistingReturn;

    // Cancellations: Only CONFIRMED orders on the same day (before pickup next day)
    const isConfirmed = order.status === 'CONFIRMED';
    const orderDate = order.createdAt;
    const hoursSinceOrder = Math.floor((Date.now() - new Date(orderDate).getTime()) / (1000 * 60 * 60));
    const sameDay = hoursSinceOrder < 24;
    const canCancel = isConfirmed && sameDay;

    const orderId = order.id;

    return (
        <div className="container mx-auto px-4 py-12 mb-20">
            <Link href="/account" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 text-sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-serif font-medium mb-2">Order #{order.orderNumber.slice(0, 8)}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-secondary'
                            }`}>
                            {order.status}
                        </span>
                    </div>
                    <Link
                        href={`/account/orders/${orderId}/invoice`}
                        target="_blank"
                        className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                    >
                        <Package className="h-3 w-3" /> Download Invoice
                    </Link>
                </div>

                {canCancel && (
                    <div className="text-right">
                        <button
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors"
                        // onClick={() => alert('Cancel order functionality - to be implemented')} // Client actions need hydration
                        >
                            <RotateCcw className="h-4 w-4" />
                            Cancel Order
                        </button>
                        <p className="text-xs text-muted-foreground mt-2">
                            Can cancel within {24 - hoursSinceOrder} hour{24 - hoursSinceOrder !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}

                {canReturn && (
                    <div className="text-right">
                        <Link
                            href={`/account/orders/${orderId}/return`}
                            className="bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Request Return
                        </Link>
                        <p className="text-xs text-muted-foreground mt-2">
                            Return window: {3 - daysSinceDelivery} day{3 - daysSinceDelivery !== 1 ? 's' : ''} remaining
                        </p>
                    </div>
                )}

                {isDelivered && !withinReturnWindow && noExistingReturn && (
                    <div className="text-right text-sm text-muted-foreground">
                        Return window expired
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-border bg-secondary/10 font-medium">Items</div>
                        <div className="divide-y divide-border">
                            {order.items.map((item: any, index: number) => {
                                // Product might not be populated correctly if deleted?
                                const product = item.product || {};
                                const images = product.images ? JSON.parse(product.images || '[]') : [];

                                return (
                                    <div key={item._id ? item._id.toString() : index} className="p-4 flex gap-4">
                                        <div className="h-20 w-16 bg-secondary/10 rounded-md relative flex-shrink-0 overflow-hidden">
                                            {images[0] && <Image src={images[0]} alt={product.name_en || 'Product'} fill className="object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium">{product.name_en || 'Unknown Product'}</h3>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <div className="text-right font-medium">
                                            ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {returnRequests.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <h3 className="font-medium text-amber-800 mb-2">Return Requests</h3>
                            {returnRequests.map((req: any) => (
                                <div key={req._id.toString()} className="text-sm text-amber-900 border-t border-amber-200 pt-2 mt-2 first:mt-0 first:border-0 first:pt-0">
                                    <div className="flex justify-between">
                                        <span>Status: <strong>{req.status}</strong></span>
                                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div>Reason: {req.reason}</div>
                                    {req.comment && <div className="text-xs mt-1 bg-white/50 p-2 rounded">Admin Note: {req.comment}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: details */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                        <h3 className="font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" /> Shipping Address
                        </h3>
                        {order.shippingAddress && (
                            <div className="text-sm text-muted-foreground">
                                <p className="text-foreground font-medium">{order.shippingAddress.name}</p>
                                <p>{order.shippingAddress.street}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                                <p>{order.shippingAddress.postalCode}</p>
                                <p>Ph: {order.shippingAddress.phone}</p>
                            </div>
                        )}
                    </div>

                    {order.status === 'SHIPPED' && order.shippingData && (
                        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                            <h3 className="font-medium flex items-center gap-2 text-indigo-600">
                                <Package className="h-4 w-4" /> Tracking Information
                            </h3>
                            {(() => {
                                try {
                                    const data = JSON.parse(order.shippingData);
                                    return (
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Provider</span>
                                                <span className="font-medium">{data.provider}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Tracking ID</span>
                                                <span className="font-medium font-mono bg-secondary/30 px-2 rounded select-all">{data.trackingId}</span>
                                            </div>
                                            <a
                                                href={`https://shiprocket.co/tracking/${data.trackingId}`}
                                                target="_blank"
                                                className="block w-full text-center mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md transition-colors font-medium"
                                            >
                                                Track Package
                                            </a>
                                        </div>
                                    );
                                } catch (e) {
                                    return null;
                                }
                            })()}
                        </div>
                    )}

                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="font-medium mb-4">Payment Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span>₹0</span>
                            </div>
                            <div className="border-t border-border pt-2 flex justify-between font-medium text-lg">
                                <span>Total</span>
                                <span>₹{Number(order.total).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="pt-2 text-xs text-muted-foreground">
                                via {order.paymentProtocol === 'RAZORPAY' ? 'Online (Razorpay)' : 'Cash on Delivery'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
