import React from 'react';
import { Clock } from 'lucide-react';

interface OrderTimelineProps {
    events: {
        id: string;
        status: string;
        note: string | null;
        createdAt: Date;
    }[];
}

const statusLabels: Record<string, string> = {
    PENDING: 'Order Placed',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
};

export function OrderTimeline({ events }: OrderTimelineProps) {
    if (events.length === 0) {
        return (
            <div className="text-sm text-muted-foreground">
                No timeline events yet
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {events.map((event, index) => (
                <div key={event.id} className="flex gap-3">
                    {/* Timeline dot and line */}
                    <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted-foreground/30'
                            }`} />
                        {index < events.length - 1 && (
                            <div className="w-0.5 h-full bg-border mt-1" />
                        )}
                    </div>

                    {/* Event content */}
                    <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium text-sm ${index === 0 ? 'text-primary' : 'text-foreground'
                                }`}>
                                {statusLabels[event.status] || event.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                            <Clock className="h-3 w-3" />
                            <span>
                                {new Date(event.createdAt).toLocaleString('en-IN', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                })}
                            </span>
                        </div>
                        {event.note && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {event.note}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
