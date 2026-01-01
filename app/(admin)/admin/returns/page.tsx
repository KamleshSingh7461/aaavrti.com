
import { getReturnRequests } from '@/actions/return-actions';
import { ReturnRequestActions } from '@/components/admin/ReturnRequestActions';
import { Package, User } from 'lucide-react';

export default async function AdminReturnsPage() {
    const requests = await getReturnRequests();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Returns & Refunds</h1>

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                        <tr>
                            <th className="px-4 py-3">Order / User</th>
                            <th className="px-4 py-3">Items</th>
                            <th className="px-4 py-3">Reason</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No return requests found.</td>
                            </tr>
                        ) : (
                            requests.map((req: any) => (
                                <tr key={req.id} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">#{req.order.orderNumber ? req.order.orderNumber.slice(-6) : req.order.id.slice(0, 8)}</div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                            <User className="h-3 w-3" /> {req.user.name}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {req.items.map((item: any) => (
                                            <div key={item.id} className="flex items-center gap-2 mb-1 last:mb-0">
                                                <div className="h-8 w-8 bg-gray-100 rounded overflow-hidden relative">
                                                    {/* Image placeholder */}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-medium">{item.orderItem.product.name_en}</div>
                                                    <div className="text-[10px] text-muted-foreground">Qty: {item.quantity}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="truncate max-w-[150px]" title={req.reason}>{req.reason}</div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${req.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                            req.status === 'APPROVED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                req.status === 'REFUNDED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    'bg-gray-100 text-gray-700 border-gray-200'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <ReturnRequestActions request={{ id: req.id, status: req.status }} />
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
