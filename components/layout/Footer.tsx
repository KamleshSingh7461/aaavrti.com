
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
        <footer className="bg-[#0f0f0f] border-t border-primary/30 mt-32 pt-20 pb-10 text-neutral-300">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-16 mb-20">

                    {/* Brand - Takes 2 columns */}
                    <div className="md:col-span-2 space-y-6">
                        <Link href="/">
                            {/* Inverting logo to white/gold for dark background if needed, or rely on it being visible */}
                            <Image
                                src="https://res.cloudinary.com/desdbjzzt/image/upload/v1767743051/OURNIKA_logo_exact_upgfui.svg"
                                alt="Ournika - Timeless Indian Fashion"
                                width={180}
                                height={60}
                                className="h-12 w-auto mb-4"
                            />
                        </Link>
                        <p className="text-neutral-400 text-sm leading-relaxed max-w-md font-light">
                            Celebrating the timeless elegance of Indian heritage through authentic handloom and craftsmanship.
                        </p>
                        <div className="flex space-x-5 pt-4">
                            {/* Social media links */}
                            <a href="#" className="text-neutral-400 hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></a>
                            <a href="#" className="text-neutral-400 hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
                            <a href="#" className="text-neutral-400 hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
                        </div>
                    </div>

                    {/* Shop */}
                    <div className="space-y-5">
                        <h4 className={cn("text-lg font-light text-primary tracking-wide", cormorant.className)}>Shop</h4>
                        <ul className="space-y-3 text-sm text-neutral-400">
                            <li><Link href="/category/women" className="hover:text-primary transition-colors">Women</Link></li>
                            <li><Link href="/category/men" className="hover:text-primary transition-colors">Men</Link></li>
                            <li><Link href="/category/kids" className="hover:text-primary transition-colors">Kids</Link></li>
                            <li><Link href="/category/accessories" className="hover:text-primary transition-colors">Accessories</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="space-y-5">
                        <h4 className={cn("text-lg font-light text-primary tracking-wide", cormorant.className)}>Company</h4>
                        <ul className="space-y-3 text-sm text-neutral-400">
                            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-5">
                        <h4 className={cn("text-lg font-light text-primary tracking-wide", cormorant.className)}>Legal</h4>
                        <ul className="space-y-3 text-sm text-neutral-400">
                            <li><Link href="/policy/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/policy/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
                            <li><Link href="/policy/refund" className="hover:text-primary transition-colors">Refund & Cancellation</Link></li>
                            <li><Link href="/policy/shipping" className="hover:text-primary transition-colors">Shipping & Delivery</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
                    <p>&copy; {new Date().getFullYear()} Ournika Private Limited. All rights reserved.</p>
                    <p>Designed by <a href="https://www.linkedin.com/in/kamleshsingh2000/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Kamlesh Kumar Singh</a></p>
                </div>
            </div>
        </footer>
    );
}
