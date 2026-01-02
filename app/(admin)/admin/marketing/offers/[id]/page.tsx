
import { getOfferById } from "@/actions/marketing-actions";
import { OfferForm } from "@/components/admin/marketing/OfferForm";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditOfferPage({ params }: PageProps) {
    const { id } = await params;
    const offer = await getOfferById(id);

    if (!offer) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold font-heading">Edit Offer</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Update offer details and validity.
                </p>
            </div>

            <OfferForm initialData={offer} isEditing />
        </div>
    );
}
