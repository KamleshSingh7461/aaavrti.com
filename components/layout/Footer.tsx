
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Cormorant_Garamond } from 'next/font/google';
import { cn } from '@/lib/utils';

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
});

export function Footer() {
    return (
        <footer className="bg-secondary/20 border-t border-border/30 mt-32 pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-16 mb-20">

                    {/* Brand - Takes 2 columns */}
                    <div className="md:col-span-2 space-y-6">
                        <Link href="/">
                            <Image
                                src="https://res.cloudinary.com/desdbjzzt/image/upload/v1767270151/gemini-2.5-flash-image_Generate_me_the_logo_with_high_quality_file_by_removing_the_transpaprent_backgro-0_ezbqis.png"
                                alt="Aaavrti"
                                width={300}
                                height={90}
                                className="object-contain mix-blend-multiply"
                            />
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                            Celebrating the timeless elegance of Indian heritage through authentic handloom and craftsmanship.
                        </p>
                        <div className="flex space-x-5 pt-4">
                            <a href="https://www.instagram.com/aaavrti.shop/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
                        </div>
                    </div>

                    {/* Shop */}
                    <div className="space-y-5">
                        <h4 className={cn("text-lg font-light text-foreground", cormorant.className)}>Shop</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/category/women" className="hover:text-primary transition-colors">Women</Link></li>
                            <li><Link href="/category/men" className="hover:text-primary transition-colors">Men</Link></li>
                            <li><Link href="/category/kids" className="hover:text-primary transition-colors">Kids</Link></li>
                            <li><Link href="/category/accessories" className="hover:text-primary transition-colors">Accessories</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="space-y-5">
                        <h4 className={cn("text-lg font-light text-foreground", cormorant.className)}>Company</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-5">
                        <h4 className={cn("text-lg font-light text-foreground", cormorant.className)}>Legal</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/policy/shipping" className="hover:text-primary transition-colors">Shipping</Link></li>
                            <li><Link href="/policy/refund" className="hover:text-primary transition-colors">Refunds</Link></li>
                            <li><Link href="/policy/terms" className="hover:text-primary transition-colors">Terms</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} KAMLESH KUMAR SINGH (Aaavrti). All rights reserved.</p>
                    <p>Designed by <a href="https://www.linkedin.com/in/kamleshsingh2000/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Kamlesh Kumar Singh</a></p>
                </div>
            </div>
        </footer>
    );
}
