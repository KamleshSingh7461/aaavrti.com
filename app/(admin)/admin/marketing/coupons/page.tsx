import { getCoupons } from "@/actions/coupon-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, TrendingUp, Users, DollarSign } from "lucide-react";

export default async function CouponsPage() {
    const coupons = await getCoupons();

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString()}`;
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const isExpired = (date: Date) => new Date(date) < new Date();
    const isActive = (validFrom: Date, validUntil: Date, active: boolean) => {
        const now = new Date();
        return active && now >= new Date(validFrom) && now <= new Date(validUntil);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold font-heading">Marketing Coupons</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track coupon performance with marketing attribution
                    </p>
                </div>
                <Link href="/admin/marketing/coupons/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Coupon
                    </Button>
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <TrendingUp className="h-4 w-4" />
                        Total Coupons
                    </div>
                    <div className="text-2xl font-bold">{coupons.length}</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Users className="h-4 w-4" />
                        Active Coupons
                    </div>
                    <div className="text-2xl font-bold">
                        {coupons.filter(c => isActive(c.validFrom, c.validUntil, c.active)).length}
                    </div>
                </div>
                <div className="bg-card border border-border p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <DollarSign className="h-4 w-4" />
                        Total Usage
                    </div>
                    <div className="text-2xl font-bold">
                        {coupons.reduce((sum, c) => sum + c.usageCount, 0)}
                    </div>
                </div>
            </div>

            {/* Coupons Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary/50 border-b border-border">
                            <tr>
                                <th className="text-left p-4 font-medium text-sm">Code</th>
                                <th className="text-left p-4 font-medium text-sm">Type</th>
                                <th className="text-left p-4 font-medium text-sm">Value</th>
                                <th className="text-left p-4 font-medium text-sm">Usage</th>
                                <th className="text-left p-4 font-medium text-sm">Valid Period</th>
                                <th className="text-left p-4 font-medium text-sm">Status</th>
                                <th className="text-left p-4 font-medium text-sm">Orders</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                                        No coupons created yet. Create your first coupon to get started.
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((coupon) => (
                                    <tr key={coupon.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                                        <td className="p-4">
                                            <Link href={`/admin/marketing/coupons/${coupon.id}`} className="font-mono font-semibold hover:text-primary">
                                                {coupon.code}
                                            </Link>
                                            {coupon.description && (
                                                <div className="text-xs text-muted-foreground mt-1">{coupon.description}</div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="outline" className="text-xs">
                                                {coupon.type.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            {coupon.type === 'PERCENTAGE' ? (
                                                <span>{Number(coupon.value)}%</span>
                                            ) : coupon.type === 'FIXED_AMOUNT' ? (
                                                <span>{formatCurrency(Number(coupon.value))}</span>
                                            ) : (
                                                <span className="text-sm">Free Shipping</span>
                                            )}
                                            {coupon.maxDiscount && (
                                                <div className="text-xs text-muted-foreground">
                                                    Max: {formatCurrency(Number(coupon.maxDiscount))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm">
                                                {coupon.usageCount} / {coupon.usageLimit || '∞'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div>{formatDate(coupon.validFrom)}</div>
                                            <div className="text-muted-foreground">to {formatDate(coupon.validUntil)}</div>
                                        </td>
                                        <td className="p-4">
                                            {isActive(coupon.validFrom, coupon.validUntil, coupon.active) ? (
                                                <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                                            ) : isExpired(coupon.validUntil) ? (
                                                <Badge variant="secondary">Expired</Badge>
                                            ) : !coupon.active ? (
                                                <Badge variant="secondary">Inactive</Badge>
                                            ) : (
                                                <Badge variant="outline">Scheduled</Badge>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm font-medium">
                                            {coupon._count?.orders || 0}
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
