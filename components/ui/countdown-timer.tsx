'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
    endTime: Date | string;
    onComplete?: () => void;
}

export function CountdownTimer({ endTime, onComplete }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const end = new Date(endTime).getTime();
            const now = new Date().getTime();
            const difference = end - now;

            if (difference <= 0) {
                setIsExpired(true);
                onComplete?.();
                return { hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime, onComplete]);

    if (isExpired) {
        return (
            <div className="text-sm text-muted-foreground">
                Offer Expired
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-muted-foreground">Ends in:</span>
            <div className="flex gap-1">
                <TimeUnit value={timeLeft.hours} label="h" />
                <span className="text-muted-foreground">:</span>
                <TimeUnit value={timeLeft.minutes} label="m" />
                <span className="text-muted-foreground">:</span>
                <TimeUnit value={timeLeft.seconds} label="s" />
            </div>
        </div>
    );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex items-baseline gap-0.5">
            <span className="text-lg font-bold tabular-nums">
                {value.toString().padStart(2, '0')}
            </span>
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    );
}

// Urgency Badge Component
interface UrgencyBadgeProps {
    type: 'low_stock' | 'trending' | 'flash_sale';
    value?: number;
}

export function UrgencyBadge({ type, value }: UrgencyBadgeProps) {
    const badges = {
        low_stock: {
            text: `Only ${value} left!`,
            className: 'bg-red-500/10 text-red-600 border-red-500/20'
        },
        trending: {
            text: `${value} people viewing`,
            className: 'bg-orange-500/10 text-orange-600 border-orange-500/20'
        },
        flash_sale: {
            text: '⚡ Flash Sale',
            className: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
        }
    };

    const badge = badges[type];

    return (
        <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded ${badge.className}`}>
            {badge.text}
        </div>
    );
}
