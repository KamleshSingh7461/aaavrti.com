
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shipping & Delivery Policy | Aaavrti',
    description: 'Read our shipping and delivery policy.',
};

export default function ShippingPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl animate-in fade-in duration-500">
            <h1 className="text-3xl font-serif mb-8 text-foreground">Shipping & Delivery Policy</h1>

            <div className="prose prose-stone dark:prose-invert max-w-none space-y-6 text-foreground/80 leading-relaxed">
                <p>
                    For International buyers, orders are shipped and delivered through registered international courier companies and/or International speed post only. For domestic buyers, orders are shipped through registered domestic courier companies and /or speed post only.
                </p>

                <p>
                    Orders are shipped within 0-7 days or as per the delivery date agreed at the time of order confirmation and delivering of the shipment subject to Courier Company / post office norms.
                </p>

                <p>
                    KAMLESH KUMAR SINGH is not liable for any delay in delivery by the courier company / postal authorities and only guarantees to hand over the consignment to the courier company or postal authorities within 0-7 days from the date of the order and payment or as per the delivery date agreed at the time of order confirmation.
                </p>

                <p>
                    Delivery of all orders will be to the address provided by the buyer. Delivery of our services will be confirmed on your mail ID as specified during registration.
                </p>

                <div className="bg-secondary/20 p-4 rounded-lg mt-8">
                    <p className="font-medium text-foreground">Contact Us</p>
                    <p>For any issues in utilizing our services you may contact our helpdesk on <span className="text-primary font-semibold">7461913495</span> or <a href="mailto:kamlesh7461@gmail.com" className="text-primary hover:underline">kamlesh7461@gmail.com</a></p>
                </div>
            </div>
        </div>
    );
}
