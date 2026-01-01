'use client';

import { useEffect } from 'react';
import { captureUTMParams } from '@/lib/utm-tracker';

/**
 * UTM Tracker Component
 * Captures marketing attribution from URL parameters on page load
 */
export function UTMTracker() {
    useEffect(() => {
        // Capture UTM parameters and store in cookies
        captureUTMParams();
    }, []);

    return null; // This component doesn't render anything
}
