'use client';

import { Search, Eye, Loader2, ArrowDownToLine, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getOrders } from '@/actions/order-actions';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadOrders = async () => {
        setLoading(true);
        const result = await getOrders({
            search: searchTerm || undefined,
            status: statusFilter !== 'all' ? statusFilter.toUpperCase() : undefined,
            page,
        });
        setOrders(result.orders);
        setTotalPages(result.pages);
        setLoading(false);
    };

    useEffect(() => {
        loadOrders();
    }, [searchTerm, statusFilter, page]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return '⏳';
            case 'CONFIRMED': return '•';
            case 'PROCESSING': return '⚙️';
            case 'SHIPPED': return '📦';
            case 'DELIVERED': return '✅';
            case 'CANCELLED': return '❌';
            default: return '•';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold font-heading">Orders</h1>
                    <p className="text-sm text-muted-foreground">Manage and process customer orders</p>
                </div>
                <button className="flex items-center gap-2 border border-border bg-background px-4 py-2 rounded-md hover:bg-secondary transition-colors text-sm font-medium">
                    <ArrowDownToLine className="h-4 w-4" />
                    Export CSV
                </button>
            </div>

            {/* Status Tabs */}
            <div className="border-b border-border flex gap-6 text-sm font-medium">
                {[
                    { value: 'all', label: 'All' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'processing', label: 'Processing' },
                    { value: 'shipped', label: 'Shipped' },
                    { value: 'delivered', label: 'Delivered' },
                    { value: 'cancelled', label: 'Cancelled' },
                ].map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => {
                            setStatusFilter(tab.value);
                            setPage(1);
                        }}
                        className={`pb-3 border-b-2 transition-colors ${statusFilter === tab.value
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="bg-card p-4 rounded-lg border border-border">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Customer, or Email..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className="pl-9 w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
                        <tr>
                            <th className="px-6 py-4">Order #</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Total & Items</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                                    <td className="px-6 py-4 font-medium font-mono text-primary">
                                        #{order.orderNumber.slice(0, 8)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium">{order.user.name || 'Guest'}</div>
                                            <div className="text-xs text-muted-foreground">{order.user.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">₹{order.total.toLocaleString('en-IN')}</div>
                                        <div className="text-xs text-muted-foreground">{order.items.length} Items</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(order.status)}
                                            <span className="text-sm font-medium">{order.status}</span>
                                        </div>
                                    </td>

                                    {/* Tracking Info */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {order.status === 'SHIPPED' && order.shippingData ? (
                                            (() => {
                                                try {
                                                    const data = JSON.parse(order.shippingData);
                                                    const trackingId = data.awbCode || data.trackingId;
                                                    return trackingId ? (
                                                        <a
                                                            href={`https://shiprocket.co/tracking/${trackingId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 font-mono text-xs flex items-center gap-1"
                                                        >
                                                            {trackingId.substring(0, 12)}...
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">Pending AWB</span>
                                                    );
                                                } catch (e) {
                                                    return <span className="text-muted-foreground text-xs">-</span>;
                                                }
                                            })()
                                        ) : (
                                            <span className="text-muted-foreground text-xs">-</span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-medium text-xs"
                                        >
                                            <Eye className="h-3 w-3" />
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 border border-border rounded-md text-sm font-medium hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1.5 border border-border rounded-md text-sm font-medium hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
