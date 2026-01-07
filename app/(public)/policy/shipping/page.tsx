
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shipping Policy | Ournika',
    description: 'Read our shipping and delivery policy.',
};

export default function ShippingPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4 text-center border-b border-border pb-8">
                <h1 className="text-3xl md:text-4xl font-serif font-medium">Shipping & Delivery Policy</h1>
                <p className="text-muted-foreground">Last updated: December 2024</p>
            </div>

            <div className="prose prose-stone dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                <p>At <strong>Ournika</strong>, we are committed to delivering your order accurately, in good condition, and always on time.</p>

                <h3 className="text-foreground font-semibold text-lg">1. Delivery Timeline</h3>
                <p>We usually dispatch orders within <strong>24-48 hours</strong> of receiving the order. Deliveries within India generally take <strong>3-7 working days</strong> depending on your location.</p>

                <h3 className="text-foreground font-semibold text-lg">2. Shipping Charges</h3>
                <p>We offer <strong>Free Shipping</strong> on all prepaid orders above ₹999. For COD orders or orders below ₹999, a nominal shipping fee of ₹100 may apply.</p>

                <h3 className="text-foreground font-semibold text-lg">3. Courier Partners</h3>
                <p>We ship via reputed courier partners like Delhivery, Bluedart, and Xpressbees to ensure safe and timely delivery.</p>

                <h3 className="text-foreground font-semibold text-lg">4. Tracking</h3>
                <p>Once your order is shipped, you will receive a tracking link via email and SMS. You can also track your order in the 'My Orders' section.</p>
            </div>
        </div>
    );
}
