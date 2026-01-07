
import { getAllOffers } from "@/actions/offer-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, TrendingUp, Percent, Tag } from "lucide-react";
import { OfferActions } from "@/components/admin/marketing/OfferActions";

export default async function OffersPage() {
    const result = await getAllOffers();
    const offers = result.success ? result.offers : [];

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const isExpired = (date: Date) => new Date(date) < new Date();
    const isActive = (active: boolean, startDate: Date, endDate: Date) => {
        const now = new Date();
        return active && now >= new Date(startDate) && now <= new Date(endDate);
    };

    const getOfferTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'PERCENTAGE': 'Percentage',
            'FIXED': 'Fixed Amount',
            'BUNDLE': 'Bundle',
            'BOGO': 'BOGO',
            'MIX_MATCH': 'Mix & Match',
            'QUANTITY_DISCOUNT': 'Qty Discount',
            'TIERED': 'Tiered'
        };
        return labels[type] || type;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold font-heading">Marketing Offers</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage promotional offers and flash sales
                    </p>
                </div>
                <Link href="/admin/marketing/offers/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Offer
                    </Button>
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Tag className="h-4 w-4" />
                        Total Offers
                    </div>
                    <div className="text-2xl font-bold">{offers.length}</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <TrendingUp className="h-4 w-4" />
                        Active Offers
                    </div>
                    <div className="text-2xl font-bold">
                        {offers.filter((o: any) => isActive(o.isActive, o.startDate, o.endDate)).length}
                    </div>
                </div>
                <div className="bg-card border border-border p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Percent className="h-4 w-4" />
                        Total Usage
                    </div>
                    <div className="text-2xl font-bold">
                        {offers.reduce((sum: number, o: any) => sum + (o.usedCount || 0), 0)}
                    </div>
                </div>
            </div>

            {/* Offers Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary/50 border-b border-border">
                            <tr>
                                <th className="text-left p-4 font-medium text-sm">Title</th>
                                <th className="text-left p-4 font-medium text-sm">Code</th>
                                <th className="text-left p-4 font-medium text-sm">Type</th>
                                <th className="text-left p-4 font-medium text-sm">Value</th>
                                <th className="text-left p-4 font-medium text-sm">Valid Period</th>
                                <th className="text-left p-4 font-medium text-sm">Status</th>
                                <th className="text-left p-4 font-medium text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                                        No offers created yet. Click "Create Offer" to get started.
                                    </td>
                                </tr>
                            ) : (
                                offers.map((offer: any) => (
                                    <tr key={offer._id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                                        <td className="p-4">
                                            <div className="font-semibold">{offer.title || offer.code}</div>
                                            {offer.description && (
                                                <div className="text-xs text-muted-foreground mt-1 truncate max-w-xs">{offer.description}</div>
                                            )}
                                        </td>
                                        <td className="p-4 font-mono text-sm">{offer.code}</td>
                                        <td className="p-4">
                                            <Badge variant="outline">{getOfferTypeLabel(offer.type)}</Badge>
                                        </td>
                                        <td className="p-4">
                                            {offer.type === 'PERCENTAGE' ? (
                                                <span className="font-semibold">{offer.value}% OFF</span>
                                            ) : offer.type === 'FIXED' ? (
                                                <span className="font-semibold">₹{offer.value} OFF</span>
                                            ) : offer.type === 'BUNDLE' || offer.type === 'MIX_MATCH' || offer.type === 'QUANTITY_DISCOUNT' ? (
                                                <span className="font-semibold">{offer.bundleQuantity} @ ₹{offer.bundlePrice}</span>
                                            ) : offer.type === 'BOGO' ? (
                                                <span className="font-semibold">Buy {offer.buyQuantity} Get {offer.getQuantity}</span>
                                            ) : (
                                                <span className="font-semibold">Tiered</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div>{formatDate(offer.startDate)}</div>
                                            <div className="text-muted-foreground">to {formatDate(offer.endDate)}</div>
                                        </td>
                                        <td className="p-4">
                                            {isActive(offer.isActive, offer.startDate, offer.endDate) ? (
                                                <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                                            ) : isExpired(offer.endDate) ? (
                                                <Badge variant="secondary">Expired</Badge>
                                            ) : !offer.isActive ? (
                                                <Badge variant="secondary">Paused</Badge>
                                            ) : (
                                                <Badge variant="outline">Scheduled</Badge>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <OfferActions
                                                offerId={offer._id}
                                                isActive={offer.isActive}
                                                offerCode={offer.code}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
