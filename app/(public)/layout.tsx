import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { SmoothScroll } from '@/components/ui/smooth-scroll';
import { Cormorant_Garamond } from 'next/font/google';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { NewsletterModal } from '@/components/home/NewsletterModal';
import { UTMTracker } from '@/components/tracking/UTMTracker';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-cormorant',
});

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={cormorant.variable}>
            <UTMTracker />
            <SmoothScroll>
                <Header />
                <main className="pb-20 md:pb-0">
                    {children}
                </main>
                <Footer />
                <CartDrawer />
                <MobileBottomNav />
                <NewsletterModal />
            </SmoothScroll>
        </div>
    );
}
