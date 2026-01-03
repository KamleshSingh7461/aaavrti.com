'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft, Loader2, Package } from 'lucide-react';
import Link from 'next/link';
import { getOrderById, updateOrderStatus } from '@/actions/order-actions';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { OrderTimeline } from '@/components/admin/OrderTimeline';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [shipping, setShipping] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [note, setNote] = useState('');

    const loadOrder = async () => {
        setLoading(true);
        const data = await getOrderById(id);
        setOrder(data);
        setNewStatus(data?.status || '');
        setLoading(false);
    };

    useEffect(() => {
        loadOrder();
    }, [id]);

    const handleStatusUpdate = async () => {
        if (!newStatus || newStatus === order?.status) return;

        setUpdating(true);
        const result = await updateOrderStatus(id, newStatus, note || undefined);
        if (result.success) {
            await loadOrder();
            setNote('');
        } else {
            alert(result.error);
        }
        setUpdating(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Order not found</p>
                <Link href="/orders" className="text-primary hover:underline mt-4 inline-block">
                    ← Back to Orders
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/orders" className="p-2 hover:bg-secondary rounded-md transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold font-heading">
                            Order #{order.orderNumber.slice(0, 8)}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                dateStyle: 'long',
                            })}
                        </p>
                    </div>
                </div>
                <OrderStatusBadge status={order.status} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="font-semibold mb-4 flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Order Items
                        </h2>
                        <div className="space-y-4">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                                    <div className="flex-1">
                                        <div className="font-medium">
                                            {item.product?.name_en || 'Unknown Product'}
                                        </div>
                                        {item.product?.sku && (
                                            <div className="text-xs text-muted-foreground">SKU: {item.product.sku}</div>
                                        )}
                                        {!item.product && (
                                            <div className="text-xs text-red-500">Product may have been deleted</div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">₹{item.price.toLocaleString('en-IN')}</div>
                                        <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                                    </div>
                                    <div className="text-right font-medium">
                                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="mt-6 pt-6 border-t border-border space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span>₹{order.tax.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>₹{order.shippingCost.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                                <span>Total</span>
                                <span>₹{order.total.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Shipping Info */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="font-semibold mb-4">Customer Information</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Details</h3>
                                <div className="space-y-1">
                                    <p className="font-medium">{order.user?.name || 'Guest'}</p>
                                    <p className="text-sm text-muted-foreground">{order.user?.email || 'No Email'}</p>
                                    {order.user?.phone && (
                                        <p className="text-sm text-muted-foreground">{order.user.phone}</p>
                                    )}
                                </div>
                            </div>
                            {order.shippingAddress ? (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Shipping Address</h3>
                                    <div className="text-sm space-y-0.5">
                                        <p className="font-medium">{order.shippingAddress.name}</p>
                                        <p>{order.shippingAddress.street}</p>
                                        <p>
                                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                                        </p>
                                        <p>{order.shippingAddress.country}</p>
                                        <p className="text-muted-foreground">Ph: {order.shippingAddress.phone}</p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Shipping Address</h3>
                                    <p className="text-sm text-yellow-600">No shipping address found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Automated Status Info */}
                    {order.status === 'CONFIRMED' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h2 className="font-semibold mb-2 text-blue-900">⚡ Automated Shipping</h2>
                            <p className="text-sm text-blue-700 mb-3">
                                This order will be automatically shipped via Shiprocket when wallet balance is sufficient.
                            </p>
                            <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                                💡 Tip: Ensure Shiprocket wallet has minimum ₹100 balance for AWB assignment
                            </div>
                        </div>
                    )}

                    {/* Shipping Info */}
                    {order.status === 'SHIPPED' && order.shippingData && (
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="font-semibold mb-4 flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Shipment Details
                                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-normal">
                                    Auto-Shipped
                                </span>
                            </h2>
                            <div className="space-y-3 text-sm">
                                {(() => {
                                    try {
                                        const data = JSON.parse(order.shippingData);
                                        return (
                                            <>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Provider</span>
                                                    <span className="font-medium">{data.provider}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Tracking ID</span>
                                                    <span className="font-medium font-mono">{data.trackingId}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Shipped Date</span>
                                                    <span>{new Date(data.shippedAt).toLocaleDateString()}</span>
                                                </div>
                                                <a
                                                    href={`https://shiprocket.co/tracking/${data.trackingId}`}
                                                    target="_blank"
                                                    className="block w-full text-center mt-4 bg-secondary py-2 rounded-md hover:bg-secondary/80 transition-colors text-primary font-medium"
                                                >
                                                    Track Shipment
                                                </a>
                                            </>
                                        );
                                    } catch (e) {
                                        return <p className="text-red-500">Error parsing shipping data</p>;
                                    }
                                })()}
                            </div>
                        </div>
                    )}



                    {/* Timeline */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="font-semibold mb-4">Order Timeline</h2>
                        <OrderTimeline events={order.events} />
                    </div>
                </div>
            </div>
        </div>
    );
}
