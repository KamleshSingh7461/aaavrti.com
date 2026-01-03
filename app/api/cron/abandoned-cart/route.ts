import { NextRequest, NextResponse } from 'next/server';
import { sendAbandonedCartEmails } from '@/actions/abandoned-cart-actions';

// This endpoint should be called by a cron job (e.g., every hour)
// Example: https://aaavrti.shop/api/cron/abandoned-cart
// 
// Setup options:
// 1. Vercel Cron Jobs (vercel.json)
// 2. External cron service (cron-job.org, EasyCron)
// 3. GitHub Actions scheduled workflow

export async function GET(request: NextRequest) {
    try {
        // Optional: Add authentication to prevent unauthorized access
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('Running abandoned cart email cron job...');

        const result = await sendAbandonedCartEmails();

        return NextResponse.json({
            ...result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Abandoned cart cron job failed:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

// Allow POST as well for manual triggers from admin panel
export async function POST(request: NextRequest) {
    return GET(request);
}
