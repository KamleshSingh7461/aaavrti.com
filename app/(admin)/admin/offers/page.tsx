import { redirect } from 'next/navigation';

/**
 * Redirect /admin/offers to /admin/marketing/coupons
 * The Offer system has been merged with Marketing Coupons
 */
export default function OffersRedirect() {
    redirect('/admin/marketing/coupons');
}
