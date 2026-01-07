import { auth } from '@/auth';
import { Cormorant_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Package, User, Clock, MapPin, Heart, ArrowRight, Truck, Settings, ShieldCheck, CreditCard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getUserOrders } from '@/actions/account-actions';
import { getAddresses } from '@/actions/checkout-actions';
import { getWishlist } from '@/actions/wishlist-actions';
import { redirect } from 'next/navigation';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

export default async function AccountPage() {
    const session = await auth();
    const user = session?.user;

    if (!user) redirect('/auth/login');

    const orders = await getUserOrders();
    const addresses = await getAddresses();
    const wishlist = await getWishlist();

    const recentOrder = orders[0];
    const defaultAddress = addresses[0];

    return (
        <StaggerContainer className="space-y-10">
            {/* Header / Welcome */}
            <StaggerItem>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-8">
                    <div className="space-y-2">
                        <h1 className={cn("text-4xl md:text-5xl font-serif font-light", cormorant.className)}>Dashboard</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            Welcome back, <span className="text-foreground font-medium">{user.name}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/account/settings"
                            className="text-xs uppercase tracking-widest font-medium bg-secondary/50 hover:bg-secondary border border-border px-4 py-2 rounded-full transition-colors flex items-center gap-2"
                        >
                            <Settings className="h-3 w-3" /> Edit Profile
                        </Link>
                    </div>
                </div>
            </StaggerItem>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Orders', value: orders.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Wishlist', value: wishlist.length, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Saved Addresses', value: addresses.length, icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Pending Orders', value: orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length, icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat, idx) => (
                    <StaggerItem key={idx}>
                        <div className="bg-card border border-border/60 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className={cn("absolute -right-2 -top-2 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-[1.7]", stat.color)}>
                                <stat.icon className="h-16 w-16" />
                            </div>
                            <div className={cn("h-10 w-10 rounded-xl mb-3 flex items-center justify-center", stat.bg, stat.color)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{stat.label}</p>
                            <p className="text-2xl font-light">{stat.value}</p>
                        </div>
                    </StaggerItem>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Order - Left Span 2 */}
                <StaggerItem className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className={cn("text-2xl font-serif font-medium", cormorant.className)}>Recent Order</h2>
                        <Link href="/account/orders" className="text-xs uppercase tracking-widest font-semibold text-primary hover:text-accent flex items-center gap-1.5 group">
                            View All <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>

                    {recentOrder ? (
                        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:border-primary/20 transition-colors">
                            <div className="p-5 border-b border-border/50 flex flex-wrap items-center justify-between gap-4 bg-secondary/5">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Order ID</p>
                                    <p className="font-serif text-lg">{recentOrder.displayId}</p>
                                </div>
                                <div className="space-y-0.5 text-right">
                                    <p className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Placed On</p>
                                    <p className="text-sm font-medium">{recentOrder.date}</p>
                                </div>
                                <div className="shrink-0">
                                    <span className={cn(
                                        "px-4 py-1.5 text-[10px] uppercase tracking-widest rounded-full font-bold border",
                                        recentOrder.status === 'CONFIRMED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                            recentOrder.status === 'PENDING' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                "bg-secondary text-secondary-foreground border-border"
                                    )}>{recentOrder.status}</span>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-4">
                                        {recentOrder.items.slice(0, 4).map((item, i) => (
                                            <div key={i} className="relative h-16 w-16 rounded-xl border-2 border-background overflow-hidden bg-secondary shadow-sm">
                                                {item.image ? (
                                                    <Image src={item.image} alt="Product" fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px]">IMG</div>
                                                )}
                                            </div>
                                        ))}
                                        {recentOrder.items.length > 4 && (
                                            <div className="h-16 w-16 rounded-xl border-2 border-background bg-secondary/80 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-muted-foreground shadow-sm">
                                                +{recentOrder.items.length - 4}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium leading-tight mb-1">
                                            {recentOrder.items[0]?.name || "Products"}
                                            {recentOrder.items.length > 1 && ` + ${recentOrder.items.length - 1} more`}
                                        </p>
                                        <p className="text-xl font-light">₹{recentOrder.total.toLocaleString()}</p>
                                    </div>
                                </div>
                                <Link
                                    href={`/account/orders/${recentOrder.id}`}
                                    className="bg-primary text-primary-foreground text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-xl hover:bg-accent transition-all text-center"
                                >
                                    Track Order
                                </Link>
                                <Link
                                    href={`/account/orders/${recentOrder.id}/invoice`}
                                    target="_blank"
                                    className="bg-secondary text-secondary-foreground text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-xl hover:bg-secondary/80 transition-all text-center"
                                >
                                    Invoice
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center">
                            <div className="h-16 w-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                            <h3 className="font-medium mb-1">No orders yet</h3>
                            <p className="text-sm text-muted-foreground mb-6">Looks like you haven't placed any orders with us yet.</p>
                            <Link href="/" className="bg-primary text-primary-foreground px-8 py-3 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-accent transition-all">
                                Explore Collections
                            </Link>
                        </div>
                    )}
                </StaggerItem>

                {/* Account Cards - Right Span 1 */}
                <div className="space-y-6">
                    {/* Member Profile */}
                    <StaggerItem>
                        <div className="bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg relative overflow-hidden group">
                            <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
                                <Package className="h-40 w-40" />
                            </div>
                            <div className="flex items-start gap-4 mb-6 relative z-10">
                                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xl font-serif font-bold">
                                    {user.name?.[0] || 'U'}
                                </div>
                                <div>
                                    <h3 className="font-serif text-xl">{user.name}</h3>
                                    <p className="text-white/70 text-xs truncate max-w-[150px]">{user.email}</p>
                                </div>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center justify-between text-[10px] uppercase tracking-tighter">
                                    <span className="opacity-70">Membership Status</span>
                                    <span className="font-bold flex items-center gap-1">
                                        <ShieldCheck className="h-3 w-3" /> Silver Tier
                                    </span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-2/3 rounded-full" />
                                </div>
                                <p className="text-[10px] opacity-70">Spend ₹5,000 more to unlock Gold benefits.</p>
                            </div>
                        </div>
                    </StaggerItem>

                    {/* Quick Links / Settings */}
                    <StaggerItem>
                        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border/40 shadow-sm">
                            <Link href="/account/addresses" className="flex items-center justify-between p-4 bg-transparent hover:bg-secondary/20 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium">Manage Addresses</span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/account/wishlist" className="flex items-center justify-between p-4 bg-transparent hover:bg-secondary/20 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                        <Heart className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium">My Wishlist</span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/account/settings" className="flex items-center justify-between p-4 bg-transparent hover:bg-secondary/20 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-secondary text-foreground flex items-center justify-center">
                                        <CreditCard className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium">Payment Methods</span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </StaggerItem>
                </div>
            </div>
        </StaggerContainer>
    );
}
