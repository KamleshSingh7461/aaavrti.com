
'use client';

import { useState } from 'react';
import { createReturnRequest } from '@/actions/return-actions';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function ReturnForm({ order, orderId }: { order: any, orderId: string }) {
    const router = useRouter();
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleItem = (itemId: string) => {
        const newSet = new Set(selectedItems);
        if (newSet.has(itemId)) newSet.delete(itemId);
        else newSet.add(itemId);
        setSelectedItems(newSet);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItems.size === 0) {
            setError('Please select at least one item to return');
            return;
        }
        if (!reason) {
            setError('Please provide a reason');
            return;
        }

        setLoading(true);
        // Map selected IDs to {id, qty}. For simplicity assuming full quantity return for now.
        const itemsToReturn = Array.from(selectedItems).map(id => {
            const item = order.items.find((i: any) => i.id === id);
            return { orderItemId: id, quantity: item.quantity };
        });

        const res = await createReturnRequest(orderId, itemsToReturn, reason);

        if (res.success) {
            router.push(`/account/orders/${orderId}`);
        } else {
            setError(res.error || 'Failed');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 bg-secondary/10 font-medium">Select Items to Return</div>
                <div className="divide-y divide-border">
                    {order.items.map((item: any) => {
                        const images = JSON.parse(item.product.images || '[]');
                        return (
                            <div key={item.id} className="p-4 flex items-start gap-4">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.has(item.id)}
                                    onChange={() => toggleItem(item.id)}
                                    className="mt-3 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <div className="h-16 w-16 bg-secondary/10 rounded-md relative flex-shrink-0 overflow-hidden">
                                    {images[0] && <img src={images[0]} alt={item.product.name_en} className="object-cover w-full h-full" />}
                                </div>
                                <div>
                                    <div className="font-medium">{item.product.name_en}</div>
                                    <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-2">
                <label className="font-medium">Reason for Return</label>
                <select
                    className="w-full p-2 border border-border rounded-md bg-background"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                >
                    <option value="">Select a reason</option>
                    <option value="Size issue">Size issue / Fit not right</option>
                    <option value="Defective">Defective / Damaged</option>
                    <option value="Wrong Item">Received Wrong Item</option>
                    <option value="Changed Mind">Changed Mind</option>
                </select>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground h-12 rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Submit Return Request'}
            </button>
        </form>
    );
}
