import React from 'react';

interface OrderStatusBadgeProps {
    status: string;
}

const statusConfig = {
    PENDING: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: '⏳',
    },
    PROCESSING: {
        label: 'Processing',
        className: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: '⚙️',
    },
    SHIPPED: {
        label: 'Shipped',
        className: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: '📦',
    },
    DELIVERED: {
        label: 'Delivered',
        className: 'bg-green-100 text-green-700 border-green-200',
        icon: '✅',
    },
    CANCELLED: {
        label: 'Cancelled',
        className: 'bg-red-100 text-red-700 border-red-200',
        icon: '❌',
    },
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    const config = statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        className: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: '•',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
            <span>{config.icon}</span>
            <span>{config.label}</span>
        </span>
    );
}
