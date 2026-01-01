'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Mail, Phone, MapPin, ShoppingCart, Calendar } from 'lucide-react';
import Link from 'next/link';
import { getCustomerById } from '@/actions/customer-actions';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCustomer = async () => {
            setLoading(true);
            const data = await getCustomerById(params.id);
            setCustomer(data);
            setLoading(false);
        };
        loadCustomer();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Customer not found</p>
                <Link href="/customers" className="text-primary hover:underline mt-4 inline-block">
                    ← Back to Customers
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/customers" className="p-2 hover:bg-secondary rounded-md transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-semibold font-heading">
                        {customer.name || 'Guest User'}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                        </span>
                        {customer.phone && (
                            <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                            </span>
                        )}
                        {customer.emailVerified && (
                            <span className="text-green-600">✓ Verified</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Total Orders</div>
                    <div className="text-2xl font-bold">{customer.stats.totalOrders}</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Total Spent</div>
                    <div className="text-2xl font-bold">₹{customer.stats.totalSpent.toLocaleString('en-IN')}</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Avg Order Value</div>
                    <div className="text-2xl font-bold">₹{customer.stats.avgOrderValue.toLocaleString('en-IN')}</div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Member Since</div>
                    <div className="text-lg font-semibold">
                        {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            year: 'numeric',
                        })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order History */}
                <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Order History
                    </h2>
                    <div className="space-y-3">
                        {customer.orders.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No orders yet
                            </p>
                        ) : (
                            customer.orders.map((order: any) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-secondary/20 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm font-medium">
                                                #{order.orderNumber.slice(0, 8)}
                                            </span>
                                            <OrderStatusBadge status={order.status} />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            ₹{order.total.toLocaleString('en-IN')}
                                        </p>
                                        <Link
                                            href={`/orders/${order.id}`}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            View →
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Addresses */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Saved Addresses
                    </h2>
                    <div className="space-y-4">
                        {customer.addresses.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No saved addresses
                            </p>
                        ) : (
                            customer.addresses.map((address: any) => (
                                <div
                                    key={address.id}
                                    className="p-3 border border-border rounded-md"
                                >
                                    {address.label && (
                                        <div className="text-xs font-medium text-primary mb-1">
                                            {address.label}
                                        </div>
                                    )}
                                    <div className="text-sm space-y-0.5">
                                        <p className="font-medium">{address.name}</p>
                                        <p className="text-muted-foreground">{address.street}</p>
                                        <p className="text-muted-foreground">
                                            {address.city}, {address.state} {address.postalCode}
                                        </p>
                                        <p className="text-muted-foreground">{address.country}</p>
                                        <p className="text-muted-foreground text-xs">
                                            Ph: {address.phone}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
