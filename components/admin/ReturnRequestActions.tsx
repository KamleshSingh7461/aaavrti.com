
'use client';

import { useState } from 'react';
import { updateReturnStatus } from '@/actions/return-actions';
import { Loader2, Check, X, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ReturnRequestActions({ request }: { request: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleAction = async (status: string, comment?: string) => {
        if (!confirm(`Are you sure you want to mark this as ${status}?`)) return;

        setLoading(true);
        const res = await updateReturnStatus(request.id, status, comment);

        if (res.success) {
            router.refresh();
        } else {
            alert(res.error || 'Failed');
        }
        setLoading(false);
    };

    if (request.status === 'REFUNDED' || request.status === 'REJECTED') {
        return <span className="text-muted-foreground text-sm font-medium">{request.status}</span>;
    }

    return (
        <div className="flex gap-2">
            {request.status === 'PENDING' && (
                <>
                    <button
                        onClick={() => handleAction('APPROVED')}
                        disabled={loading}
                        className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                        title="Approve Return (Item Received)"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={() => handleAction('REJECTED')}
                        disabled={loading}
                        className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                        title="Reject Return"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    </button>
                </>
            )}

            {request.status === 'APPROVED' && (
                <button
                    onClick={() => handleAction('REFUNDED')}
                    disabled={loading}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium flex items-center gap-2"
                >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    Process Refund
                </button>
            )}
        </div>
    );
}
