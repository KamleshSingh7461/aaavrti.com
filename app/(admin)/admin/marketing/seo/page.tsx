import { getAllPageMetadata, getSEORankings } from "@/actions/seo-actions";
import SEOClient from "./seo-client";

export const metadata = {
    title: "SEO Management | Admin",
    description: "Manage SEO metadata and rankings"
};

export default async function SEOPage() {
    const [pageMetadata, rankings] = await Promise.all([
        getAllPageMetadata(),
        getSEORankings()
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold font-heading">SEO Management</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage meta tags, track rankings, and monitor search performance
                </p>
            </div>

            <SEOClient metadata={pageMetadata} rankings={rankings} />
        </div>
    );
}
