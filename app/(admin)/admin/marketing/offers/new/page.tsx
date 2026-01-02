
import { OfferForm } from "@/components/admin/marketing/OfferForm";

export default function NewOfferPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold font-heading">Create New Offer</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Set up a new promotional offer or sale.
                </p>
            </div>

            <OfferForm />
        </div>
    );
}
