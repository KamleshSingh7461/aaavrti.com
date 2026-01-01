/**
 * UTM Parameter Tracking Utility
 * Captures marketing attribution from URL parameters and stores in cookies
 */

interface UTMParams {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
}

interface Attribution {
    source: string;
    medium: string;
    campaign?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
}

const COOKIE_NAME = 'marketing_attribution';
const COOKIE_EXPIRY_DAYS = 30;

/**
 * Extract UTM parameters from URL
 */
export function extractUTMParams(url: string = typeof window !== 'undefined' ? window.location.href : ''): UTMParams {
    if (typeof window === 'undefined') return {};

    const urlParams = new URLSearchParams(new URL(url).search);

    return {
        utm_source: urlParams.get('utm_source') || undefined,
        utm_medium: urlParams.get('utm_medium') || undefined,
        utm_campaign: urlParams.get('utm_campaign') || undefined,
        utm_content: urlParams.get('utm_content') || undefined,
        utm_term: urlParams.get('utm_term') || undefined,
    };
}

/**
 * Determine traffic source from referrer
 */
function getSourceFromReferrer(referrer: string): { source: string; medium: string } {
    if (!referrer) {
        return { source: 'DIRECT', medium: 'none' };
    }

    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();

    // Social media sources
    if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
        return { source: 'facebook', medium: 'social' };
    }
    if (hostname.includes('instagram.com')) {
        return { source: 'instagram', medium: 'social' };
    }
    if (hostname.includes('twitter.com') || hostname.includes('t.co')) {
        return { source: 'twitter', medium: 'social' };
    }
    if (hostname.includes('linkedin.com')) {
        return { source: 'linkedin', medium: 'social' };
    }
    if (hostname.includes('pinterest.com')) {
        return { source: 'pinterest', medium: 'social' };
    }

    // Search engines
    if (hostname.includes('google.')) {
        return { source: 'google', medium: 'organic' };
    }
    if (hostname.includes('bing.com')) {
        return { source: 'bing', medium: 'organic' };
    }
    if (hostname.includes('yahoo.com')) {
        return { source: 'yahoo', medium: 'organic' };
    }

    // Other referrals
    return { source: hostname, medium: 'referral' };
}

/**
 * Capture and store UTM parameters in cookies
 */
export function captureUTMParams(): void {
    if (typeof window === 'undefined') return;

    const utmParams = extractUTMParams();
    const hasUTMParams = Object.values(utmParams).some(v => v !== undefined);

    let attribution: Attribution;

    if (hasUTMParams) {
        // Use UTM parameters
        attribution = {
            source: utmParams.utm_source || 'UNKNOWN',
            medium: utmParams.utm_medium || 'UNKNOWN',
            campaign: utmParams.utm_campaign,
            utmSource: utmParams.utm_source,
            utmMedium: utmParams.utm_medium,
            utmCampaign: utmParams.utm_campaign,
            utmContent: utmParams.utm_content,
            utmTerm: utmParams.utm_term,
        };
    } else {
        // Determine from referrer
        const referrerAttribution = getSourceFromReferrer(document.referrer);
        attribution = {
            source: referrerAttribution.source,
            medium: referrerAttribution.medium,
        };
    }

    // Store in cookie
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);

    document.cookie = `${COOKIE_NAME}=${JSON.stringify(attribution)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Get stored attribution data from cookies
 */
export function getAttribution(): Attribution | null {
    if (typeof window === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const attributionCookie = cookies.find(c => c.trim().startsWith(`${COOKIE_NAME}=`));

    if (!attributionCookie) return null;

    try {
        const value = attributionCookie.split('=')[1];
        return JSON.parse(decodeURIComponent(value));
    } catch {
        return null;
    }
}

/**
 * Clear attribution data (useful for testing)
 */
export function clearAttribution(): void {
    if (typeof window === 'undefined') return;
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * Get attribution for server-side (from cookies header)
 */
export function getAttributionFromCookies(cookieHeader: string | null): Attribution | null {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';');
    const attributionCookie = cookies.find(c => c.trim().startsWith(`${COOKIE_NAME}=`));

    if (!attributionCookie) return null;

    try {
        const value = attributionCookie.split('=')[1];
        return JSON.parse(decodeURIComponent(value));
    } catch {
        return null;
    }
}
