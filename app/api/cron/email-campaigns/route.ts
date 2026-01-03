import { NextRequest, NextResponse } from 'next/server';
import {
    sendWelcomeSeries,
    sendPostPurchaseFlow,
    sendWinBackCampaign
} from '@/actions/email-campaigns';

// This endpoint should be called by a cron job (e.g., daily)
// Example: https://aaavrti.shop/api/cron/email-campaigns

export async function GET(request: NextRequest) {
    try {
        // Optional: Add authentication
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Running email campaigns cron job...');

        // Run all campaigns in parallel
        const [welcomeResult, postPurchaseResult, winBackResult] = await Promise.all([
            sendWelcomeSeries(),
            sendPostPurchaseFlow(),
            sendWinBackCampaign()
        ]);

        return NextResponse.json({
            success: true,
            results: {
                welcome: welcomeResult,
                postPurchase: postPurchaseResult,
                winBack: winBackResult
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Email campaigns cron job failed:', error);
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

export async function POST(request: NextRequest) {
    return GET(request);
}
