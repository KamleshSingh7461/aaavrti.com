
'use client';

import { useState, useEffect } from 'react';
import { getInventory, updateStock } from '@/actions/inventory-actions';
import { Loader2, AlertTriangle, Save, Search, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function InventoryPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<number>(0);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await getInventory();
        setItems(data);
        setLoading(false);
    };

    const handleSave = async (item: any) => {
        setSaving(true);
        const result = await updateStock(item.productId, item.id, editValue);

        if (result.success) {
            toast({ title: "Stock Updated", description: "Invetory level updated successfully." });
            // Optimistic update
            setItems(items.map(i => i.id === item.id ? { ...i, stock: editValue } : i));
            setEditingId(null);
        } else {
            toast({ title: "Error", description: "Failed to update stock.", variant: "destructive" });
        }
        setSaving(false);
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold font-heading">Inventory</h1>
                    <p className="text-sm text-muted-foreground">Manage stock levels for products and variants</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-card p-4 rounded-lg border border-border">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
                        <tr>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">SKU</th>
                            <th className="px-6 py-4">Current Stock</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredItems.map(item => (
                            <tr key={`${item.productId}-${item.id}`} className="hover:bg-secondary/20">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-10 w-10 bg-secondary/20 rounded overflow-hidden">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-muted-foreground">{item.sku}</td>
                                <td className="px-6 py-4">
                                    {editingId === item.id ? (
                                        <input
                                            type="number"
                                            value={editValue}
                                            onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                                            className="w-20 border rounded px-2 py-1"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="font-medium">{item.stock}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {item.stock <= 5 ? (
                                        <span className="inline-flex items-center text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-medium">
                                            <AlertTriangle className="w-3 h-3 mr-1" /> Low Stock
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-medium">
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> In Stock
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {editingId === item.id ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleSave(item)}
                                                disabled={saving}
                                                className="bg-primary text-primary-foreground p-1.5 rounded hover:bg-primary/90"
                                            >
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="text-muted-foreground p-1.5 hover:text-foreground">Cancel</button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setEditingId(item.id); setEditValue(item.stock); }}
                                            className="text-primary hover:underline font-medium"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
