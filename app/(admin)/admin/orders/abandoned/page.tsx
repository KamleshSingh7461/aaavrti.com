'use client';

import { AlertCircle, Clock, Mail, Search, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAbandonedCheckouts, sendRecoveryEmail } from '@/actions/order-actions';
import { toast } from 'sonner';

export default function AdminAbandonedOrdersPage() {
    const [abandoned, setAbandoned] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingId, setSendingId] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        const data = await getAbandonedCheckouts();
        setAbandoned(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSendRecovery = async (orderId: string, email: string) => {
        setSendingId(orderId);
        const toastId = toast.loading(`Sending recovery email to ${email}...`);

        try {
            const result = await sendRecoveryEmail(orderId);
            if (result.success) {
                toast.success(`Recovery email sent successfully!`, { id: toastId });
            } else {
                toast.error(result.error || 'Failed to send recovery email.', { id: toastId });
            }
        } catch (error) {
            toast.error('Something went wrong.', { id: toastId });
        } finally {
            setSendingId(null);
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
            <div>
                <h1 className="text-2xl font-semibold font-heading flex items-center gap-2">
                    Abandoned Checkouts
                    <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        {abandoned.length}
                    </span>
                </h1>
                <p className="text-sm text-muted-foreground">Review and recover lost sales from incomplete checkouts.</p>
            </div>

            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
                        <tr>
                            <th className="px-6 py-4">Checkout ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Cart Items</th>
                            <th className="px-6 py-4">Value</th>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {abandoned.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                    No abandoned checkouts found
                                </td>
                            </tr>
                        ) : (
                            abandoned.map((order) => (
                                <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-primary">#{order.orderNumber.slice(0, 8)}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{order.user?.name || 'Guest'}</div>
                                        <div className="text-xs text-muted-foreground">{order.user?.email || 'No Email'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">
                                        {order.items.map((item: any) => item.product?.name_en || 'Unknown Product').join(', ')}
                                    </td>
                                    <td className="px-6 py-4 font-medium">₹{order.total.toLocaleString('en-IN')}</td>
                                    <td className="px-6 py-4 text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium border bg-orange-50 text-orange-700 border-orange-200 uppercase tracking-wider">
                                            Not Recovered
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleSendRecovery(order.id, order.user?.email || '')}
                                            disabled={sendingId === order.id}
                                            className="flex items-center gap-1 text-primary hover:underline text-xs ml-auto font-medium transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {sendingId === order.id ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <Mail className="h-3 w-3" />
                                            )}
                                            {sendingId === order.id ? 'Sending...' : 'Send Recovery Email'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
