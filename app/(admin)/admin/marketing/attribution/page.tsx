import { getMarketingOverview } from "@/actions/marketing-analytics-actions";
import { TrendingUp, ShoppingBag, DollarSign, Tag } from "lucide-react";

export default async function MarketingAttributionPage() {
    const data = await getMarketingOverview();

    const formatCurrency = (amount: number) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
        return `₹${amount.toFixed(0)}`;
    };

    const maxChannelRevenue = Math.max(...data.channels.map(c => c.revenue), 1);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold font-heading">Marketing Attribution</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Track which channels drive your sales
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <DollarSign className="h-4 w-4" />
                        Total Revenue
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(data.summary.totalRevenue)}</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <ShoppingBag className="h-4 w-4" />
                        Total Orders
                    </div>
                    <div className="text-2xl font-bold">{data.summary.totalOrders}</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <TrendingUp className="h-4 w-4" />
                        Avg Order Value
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(data.summary.averageOrderValue)}</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Tag className="h-4 w-4" />
                        Total Discounts
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(data.summary.totalDiscount)}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Channel Performance */}
                <div className="bg-card border border-border p-6 rounded-lg">
                    <h3 className="font-heading font-medium text-lg mb-4">Channel Performance</h3>
                    {data.channels.length > 0 ? (
                        <div className="space-y-4">
                            {data.channels.map((channel, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{channel.source}</span>
                                        <span className="text-muted-foreground">{formatCurrency(channel.revenue)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all"
                                                style={{ width: `${(channel.revenue / maxChannelRevenue) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground w-12 text-right">
                                            {channel.orders} orders
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        AOV: {formatCurrency(channel.averageOrderValue)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No channel data available yet</p>
                            <p className="text-xs mt-1">Orders will appear here once completed</p>
                        </div>
                    )}
                </div>

                {/* Top Coupons */}
                <div className="bg-card border border-border p-6 rounded-lg">
                    <h3 className="font-heading font-medium text-lg mb-4">Top Performing Coupons</h3>
                    {data.coupons.length > 0 ? (
                        <div className="space-y-3">
                            {data.coupons.map((coupon, idx) => (
                                <div key={coupon.id} className="flex items-center justify-between p-3 bg-secondary/10 rounded-md">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-muted-foreground w-6">0{idx + 1}</span>
                                        <div>
                                            <div className="font-mono font-semibold">{coupon.code}</div>
                                            <div className="text-xs text-muted-foreground">{coupon.orders} orders</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">{formatCurrency(coupon.revenue)}</div>
                                        <div className="text-xs text-muted-foreground">
                                            ROI: {coupon.roi.toFixed(1)}x
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No coupon data available yet</p>
                            <p className="text-xs mt-1">Create coupons to track performance</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Campaign Performance */}
            {data.campaigns.length > 0 && (
                <div className="bg-card border border-border p-6 rounded-lg">
                    <h3 className="font-heading font-medium text-lg mb-4">Campaign Performance</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-border">
                                <tr>
                                    <th className="text-left p-3 font-medium text-sm">Campaign</th>
                                    <th className="text-left p-3 font-medium text-sm">Source</th>
                                    <th className="text-left p-3 font-medium text-sm">Medium</th>
                                    <th className="text-right p-3 font-medium text-sm">Orders</th>
                                    <th className="text-right p-3 font-medium text-sm">Revenue</th>
                                    <th className="text-right p-3 font-medium text-sm">AOV</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.campaigns.map((campaign, idx) => (
                                    <tr key={idx} className="border-b border-border">
                                        <td className="p-3 font-medium">{campaign.campaign}</td>
                                        <td className="p-3 text-sm">{campaign.source}</td>
                                        <td className="p-3 text-sm">{campaign.medium}</td>
                                        <td className="p-3 text-right">{campaign.orders}</td>
                                        <td className="p-3 text-right font-medium">{formatCurrency(campaign.revenue)}</td>
                                        <td className="p-3 text-right text-sm text-muted-foreground">
                                            {formatCurrency(campaign.averageOrderValue)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
