
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cancellation & Refund Policy | Aaavrti',
    description: 'Read our cancellation and refund policy.',
};

export default function RefundPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4 text-center border-b border-border pb-8">
                <h1 className="text-3xl md:text-4xl font-serif font-medium">Cancellation & Refund Policy</h1>
                <p className="text-muted-foreground">Last updated: December 2024</p>
            </div>

            <div className="prose prose-stone dark:prose-invert max-w-none space-y-6">
                <p>
                    <strong>KAMLESH KUMAR SINGH</strong> (operating as Aaavrti) believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:
                </p>

                <section>
                    <h2 className="text-xl font-semibold mb-3">Cancellations</h2>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                        <li>
                            Cancellations will be considered only if the request is made within <strong>2-3 days</strong> of placing the order.
                        </li>
                        <li>
                            However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.
                        </li>
                        <li>
                            We do not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">Damaged or Defective Items</h2>
                    <p className="text-muted-foreground">
                        In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within <strong>2-3 days</strong> of receipt of the products.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">Product Discrepancy</h2>
                    <p className="text-muted-foreground">
                        In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within <strong>2-3 days</strong> of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">Manufacturer Warranty</h2>
                    <p className="text-muted-foreground">
                        In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">Refund Processing</h2>
                    <p className="text-muted-foreground">
                        In case of any Refunds approved by <strong>KAMLESH KUMAR SINGH</strong>, it’ll take <strong>2-3 days</strong> for the refund to be processed to the end customer.
                    </p>
                </section>
            </div>

            <div className="bg-secondary/20 p-6 rounded-lg border border-border mt-8">
                <h3 className="font-semibold mb-2">Need help?</h3>
                <p className="text-sm text-muted-foreground">
                    Contact us at <a href="mailto:support@aaavrti.com" className="text-primary hover:underline">support@aaavrti.com</a> for any questions related to refunds and cancellations.
                </p>
            </div>
        </div>
    );
}
