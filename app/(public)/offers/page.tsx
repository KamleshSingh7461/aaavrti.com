
import dbConnect from '@/lib/db';
import { Offer } from '@/lib/models/Marketing'; // Assuming Offer is exported from Marketing.ts
import Link from 'next/link';
import { FadeIn } from '@/components/ui/motion';
import { Tag, Clock, ArrowRight } from 'lucide-react';

export const metadata = {
    title: 'Special Offers | Ournika',
    description: 'Discover our latest deals and special offers on authentic Indian wear.'
};

export default async function OffersPage() {
    await dbConnect();

    // Fetch all active offers
    const offers = await Offer.find({
        isActive: true,
        $or: [
            { endDate: null },
            { endDate: { $gte: new Date() } }
        ]
    })
        .sort({ createdAt: -1 })
        .lean();

    return (
        <div className="container mx-auto px-4 py-12 min-h-[60vh]">
            {/* Header */}
            <div className="space-y-4 text-center max-w-2xl mx-auto mb-12">
                <FadeIn>
                    <h1 className="text-4xl md:text-5xl font-serif text-foreground font-medium">
                        Special Offers
                    </h1>
                </FadeIn>
                <div className="w-24 h-1 bg-primary mx-auto rounded-full my-4" />
                <FadeIn delay={0.1}>
                    <p className="text-muted-foreground text-lg">
                        Exclusive deals on our finest collections
                    </p>
                </FadeIn>
            </div>

            {/* Offers Grid */}
            {offers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map((offer: any) => {
                        const isExpiringSoon = offer.endDate &&
                            new Date(offer.endDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

                        return (
                            <div
                                key={offer._id.toString()}
                                className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-card"
                            >
                                <div className="p-6 space-y-4">
                                    {/* Offer Badge */}
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-5 w-5 text-primary" />
                                        <span className="font-mono text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                                            {offer.code}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-serif font-medium">
                                        {offer.type === 'PERCENTAGE' ? `${Number(offer.value)}% Discount` : 'Flat Discount'}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {offer.type === 'PERCENTAGE'
                                            ? `Get ${Number(offer.value)}% off on your purchase.`
                                            : `Get flat ₹${Number(offer.value)} off.`}
                                    </p>

                                    {/* Discount */}
                                    <div className="text-3xl font-bold text-primary">
                                        {offer.type === 'PERCENTAGE' ? (
                                            <>{Number(offer.value)}% OFF</>
                                        ) : (
                                            <>₹{Number(offer.value)} OFF</>
                                        )}
                                    </div>

                                    {/* Validity */}
                                    {offer.endDate && (
                                        <div className={`flex items-center gap-2 text-sm ${isExpiringSoon ? 'text-red-600' : 'text-muted-foreground'
                                            }`}>
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                Valid until {new Date(offer.endDate).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}

                                    {/* CTA */}
                                    <Link
                                        href="/products"
                                        className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                                    >
                                        Shop Now
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No active offers at the moment.</p>
                    <Link href="/products" className="text-primary hover:underline mt-4 inline-block">
                        Browse all products
                    </Link>
                </div>
            )}
        </div>
    );
}
