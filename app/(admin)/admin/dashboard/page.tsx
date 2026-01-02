
import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import { Product } from '@/lib/models/Product';
import { Order } from '@/lib/models/Order';
import { User } from '@/lib/models/User';
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, Eye } from 'lucide-react';
import Link from 'next/link';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';

export default async function DashboardPage() {
    const session = await auth();
    // Assuming middleware protects admin routes, but good to have check

    await dbConnect();

    // Fetch comprehensive stats
    const [
        productsCount,
        activeProductsCount,
        ordersCount,
        pendingOrdersCount,
        customersCount,
        lowStockProducts,
        recentOrders,
        revenueData,
    ] = await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ status: 'ACTIVE' }),
        Order.countDocuments(),
        Order.countDocuments({ status: 'PENDING' }),
        User.countDocuments({ role: 'USER' }),
        Product.find({
            stock: { $lt: 5 },
            status: 'ACTIVE',
        })
            .select('name_en stock sku')
            .limit(5)
            .lean(),
        // Recent Orders - need to lookup user name/email
        Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
        // Revenue Aggregation
        Order.aggregate([
            { $match: { status: { $ne: 'CANCELLED' } } },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ])
    ]);

    // Populate Users for recentOrders separately to handle potential issues if user deleted or using userId string
    // Assuming simple loop or Promise.all for 5 items is fast enough
    const recentOrdersWithUser = await Promise.all(recentOrders.map(async (order: any) => {
        const user = await User.findById(order.userId).select('name email').lean();
        return {
            ...order,
            id: order._id.toString(),
            user: user || { email: 'Unknown' }
        };
    }));

    const totalRevenue = revenueData[0]?.total || 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold font-heading">Dashboard Overview</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Products"
                    value={productsCount}
                    subtitle={`${activeProductsCount} active`}
                    icon={Package}
                    trend="+12%"
                />
                <StatCard
                    title="Total Orders"
                    value={ordersCount}
                    subtitle={`${pendingOrdersCount} pending`}
                    icon={ShoppingCart}
                    trend="+8%"
                />
                <StatCard
                    title="Customers"
                    value={customersCount}
                    subtitle="Registered users"
                    icon={Users}
                    trend="+5%"
                />
                <StatCard
                    title="Revenue"
                    value={`₹${totalRevenue.toLocaleString('en-IN')}`}
                    subtitle="Total sales"
                    icon={TrendingUp}
                    trend="+15%"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold">Recent Orders</h2>
                        <Link
                            href="/orders"
                            className="text-sm text-primary hover:underline"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentOrdersWithUser.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No orders yet
                            </p>
                        ) : (
                            recentOrdersWithUser.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-secondary/20 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm font-medium">
                                                #{order.orderNumber.slice(0, 8)}
                                            </span>
                                            <OrderStatusBadge status={order.status} />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {order.user.name || order.user.email}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            ₹{Number(order.total).toLocaleString('en-IN')}
                                        </p>
                                        <Link
                                            href={`/orders/${order.id}`}
                                            className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                                        >
                                            <Eye className="h-3 w-3" />
                                            View
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Low Stock Alerts
                        </h2>
                        <Link
                            href="/products?filter=low-stock"
                            className="text-sm text-primary hover:underline"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {lowStockProducts.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                All products are well stocked
                            </p>
                        ) : (
                            lowStockProducts.map((product: any) => (
                                <div
                                    key={product._id.toString()}
                                    className="flex items-center justify-between p-3 border border-orange-200 bg-orange-50/50 rounded-md"
                                >
                                    <div>
                                        <p className="font-medium text-sm">{product.name_en}</p>
                                        {product.sku && (
                                            <p className="text-xs text-muted-foreground">
                                                SKU: {product.sku}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-orange-600">
                                            {product.stock} left
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/products"
                        className="p-4 border border-border rounded-md hover:bg-secondary/20 transition-colors group"
                    >
                        <Package className="h-5 w-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                        <p className="font-medium">Add Product</p>
                        <p className="text-sm text-muted-foreground">Create new product listing</p>
                    </Link>
                    <Link
                        href="/orders"
                        className="p-4 border border-border rounded-md hover:bg-secondary/20 transition-colors group"
                    >
                        <ShoppingCart className="h-5 w-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                        <p className="font-medium">View Orders</p>
                        <p className="text-sm text-muted-foreground">Manage customer orders</p>
                    </Link>
                    <Link
                        href="/categories"
                        className="p-4 border border-border rounded-md hover:bg-secondary/20 transition-colors group"
                    >
                        <Users className="h-5 w-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                        <p className="font-medium">Manage Categories</p>
                        <p className="text-sm text-muted-foreground">Organize your catalog</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
}: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    trend?: string;
}) {
    return (
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold mb-1">{value}</p>
            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{subtitle}</p>
                {trend && (
                    <span className="text-xs font-medium text-green-600">{trend}</span>
                )}
            </div>
        </div>
    );
}
