
import { getOffers } from "@/actions/marketing-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, TrendingUp, Percent, Tag } from "lucide-react";

export default async function OffersPage() {
    const offers = await getOffers();

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
                    {/* Assuming offers have usage tracking eventually, or just sum up something else */}
                    <div className="text-2xl font-bold"> - </div>
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
                                <th className="text-left p-4 font-medium text-sm">Value</th>
                                <th className="text-left p-4 font-medium text-sm">Valid Period</th>
                                <th className="text-left p-4 font-medium text-sm">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-muted-foreground">
                                        No offers created yet.
                                    </td>
                                </tr>
                            ) : (
                                offers.map((offer: any) => (
                                    <tr key={offer._id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                                        <td className="p-4">
                                            <Link href={`/admin/marketing/offers/${offer._id}`} className="font-semibold hover:text-primary">
                                                {offer.title}
                                            </Link>
                                            {offer.description && (
                                                <div className="text-xs text-muted-foreground mt-1 truncate max-w-xs">{offer.description}</div>
                                            )}
                                        </td>
                                        <td className="p-4 font-mono text-sm">{offer.code}</td>
                                        <td className="p-4">
                                            {offer.type === 'PERCENTAGE' ? (
                                                <Badge variant="outline">{offer.value}% OFF</Badge>
                                            ) : (
                                                <Badge variant="outline">₹{offer.value} OFF</Badge>
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
                                                <Badge variant="secondary">Inactive</Badge>
                                            ) : (
                                                <Badge variant="outline">Scheduled</Badge>
                                            )}
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
