
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cancellation & Refund Policy | Ournika',
    description: 'Read our cancellation and refund policy.',
};

export default function RefundPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl animate-in fade-in duration-500">
            <h1 className="text-3xl font-serif mb-8 text-foreground">Cancellation & Refund Policy</h1>

            <div className="prose prose-stone dark:prose-invert max-w-none space-y-6 text-foreground/80 leading-relaxed">
                <p>
                    Ournika Private Limited believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:
                </p>

                <section>
                    <h2 className="text-xl font-medium text-foreground mb-3">Cancellations</h2>
                    <p>
                        Cancellations will be considered only if the request is made within 2-3 days of placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.
                    </p>
                    <p className="mt-4">
                        Ournika Private Limited does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-medium text-foreground mb-3">Damaged or Defective Items</h2>
                    <p>
                        In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within 2-3 days of receipt of the products.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-medium text-foreground mb-3">Product Discrepancy</h2>
                    <p>
                        In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 2-3 days of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-medium text-foreground mb-3">Manufacturer Warranty</h2>
                    <p>
                        In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-medium text-foreground mb-3">Refund Processing</h2>
                    <p>
                        In case of any Refunds approved by the KAMLESH KUMAR SINGH, it’ll take 2-3 days for the refund to be processed to the end customer.
                    </p>
                </section>
            </div>
        </div>
    );
}
