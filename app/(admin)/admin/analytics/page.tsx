
import { BarChart3, TrendingUp, Users, ShoppingBag } from 'lucide-react';
import { getAnalyticsSummary, getMonthlyRevenue, getTopProducts } from '@/actions/analytics-actions';

export default async function AdminAnalyticsPage() {
    const [summary, monthlyRevenue, topProducts] = await Promise.all([
        getAnalyticsSummary(),
        getMonthlyRevenue(),
        getTopProducts(4)
    ]);

    // Format currency
    const formatCurrency = (amount: number) => {
        if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
        return `₹${amount.toFixed(0)}`;
    };

    // Calculate max revenue for chart scaling
    const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold font-heading">Analytics</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Total Sales"
                    value={formatCurrency(summary.totalSales)}
                    trend={summary.salesTrend}
                    icon={TrendingUp}
                    color="bg-green-100 text-green-700"
                />
                <KPICard
                    title="Total Orders"
                    value={summary.totalOrders.toLocaleString()}
                    trend={summary.ordersTrend}
                    icon={ShoppingBag}
                    color="bg-blue-100 text-blue-700"
                />
                <KPICard
                    title="New Customers"
                    value={summary.newCustomers.toString()}
                    trend={summary.customersTrend}
                    icon={Users}
                    color="bg-orange-100 text-orange-700"
                />
                <KPICard
                    title="Avg Order Value"
                    value={summary.totalOrders > 0 ? formatCurrency(summary.totalSales / summary.totalOrders) : '₹0'}
                    trend="+0%"
                    icon={BarChart3}
                    color="bg-purple-100 text-purple-700"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
                    <h3 className="font-heading font-medium text-lg mb-4">Revenue Overview (2026)</h3>
                    <div className="h-64 flex items-end justify-between px-4 pb-2 border-b border-border gap-2">
                        {monthlyRevenue.map((month, i) => {
                            const heightPercent = maxRevenue > 0 ? (month.revenue / maxRevenue * 100) : 0;
                            return (
                                <div
                                    key={i}
                                    className="w-full bg-primary/20 rounded-t hover:bg-primary transition-colors group relative"
                                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                                >
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {formatCurrency(month.revenue)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground px-2">
                        {monthlyRevenue.map((month, i) => (
                            <span key={i}>{month.month}</span>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
                    <h3 className="font-heading font-medium text-lg mb-4">Top Performing Products</h3>
                    {topProducts.length > 0 ? (
                        <div className="space-y-4">
                            {topProducts.map((p, i) => (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-secondary/10 rounded-md">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-muted-foreground w-6">0{i + 1}</span>
                                        <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">{formatCurrency(p.totalRevenue)}</div>
                                        <div className="text-xs text-muted-foreground">{p.totalSales} Sales</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No sales data available yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, trend, icon: Icon, color }: any) {
    const isPositive = trend.startsWith('+');
    const isNegative = trend.startsWith('-');

    return (
        <div className="bg-card border border-border p-6 rounded-lg shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm text-muted-foreground font-medium">{title}</p>
                <h3 className="text-2xl font-bold mt-1">{value}</h3>
                <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                    {trend} from last month
                </span>
            </div>
            <div className={`p-3 rounded-full ${color}`}>
                <Icon className="h-5 w-5" />
            </div>
        </div>
    )
}
