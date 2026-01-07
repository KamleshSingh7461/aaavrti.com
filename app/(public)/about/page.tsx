
import { Metadata } from 'next';
import { FadeIn, SlideInFromLeft, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { Outfit } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ArrowRight, Leaf, ShieldCheck, HeartHandshake } from 'lucide-react';
import Link from 'next/link';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'About Us | Ournika',
    description: 'Our story of heritage and craftsmanship.',
};

export default function AboutPage() {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-black/5">
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    <img
                        src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=2000&auto=format&fit=crop"
                        alt="Heritage looms"
                        className="w-full h-full object-cover grayscale"
                    />
                </div>

                <div className="container relative z-10 px-4 text-center">
                    <FadeIn>
                        <span className="text-primary font-medium tracking-widest uppercase text-sm">Our Story</span>
                        <h1 className={cn("text-5xl md:text-7xl font-bold mt-4 mb-6 leading-tight", outfit.className)}>
                            Weaving <span className="text-muted-foreground italic font-serif">Tradition</span> into <br /> Modern Life.
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
                            Aaavrti is more than a brand; it's a bridge between India's rich handloom heritage and the contemporary wardrobe.
                        </p>
                    </FadeIn>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 px-4 bg-background">
                <StaggerContainer className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    <StaggerItem className="text-center space-y-4 p-8 rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-colors">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                            <Leaf className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold">Sustainable Fashion</h3>
                        <p className="text-muted-foreground">Ethically sourced fabrics and eco-friendly dyes. We believe in fashion that heals the planet.</p>
                    </StaggerItem>

                    <StaggerItem className="text-center space-y-4 p-8 rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-colors">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                            <HeartHandshake className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold">Artisan Empowered</h3>
                        <p className="text-muted-foreground">Direct partnerships with weavers in Varanasi and Lucknow, ensuring fair wages and respect.</p>
                    </StaggerItem>

                    <StaggerItem className="text-center space-y-4 p-8 rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-colors">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-semibold">Authenticity Guaranteed</h3>
                        <p className="text-muted-foreground">Every thread tells a story. We certify the authenticity of every handloom product we sell.</p>
                    </StaggerItem>
                </StaggerContainer>
            </section>

            {/* Founder/Mission Split */}
            <section className="py-24 border-t border-border/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <SlideInFromLeft className="relative aspect-[4/5] md:aspect-square bg-secondary rounded-lg overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1596205844026-621868357a07?q=80&w=1200"
                                alt="Artisan working"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </SlideInFromLeft>

                        <div className="space-y-8">
                            <FadeIn delay={0.2}>
                                <h2 className={cn("text-4xl md:text-5xl font-bold text-foreground", outfit.className)}>
                                    Preserving the Art of <span className="font-serif italic text-primary">Handloom</span>
                                </h2>
                                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                                    <p>
                                        In a world of fast fashion, Aaavrti stands still. We pause to appreciate the rhythmic clatter of the loom, the patience of the dyer, and the heritage passed down through generations.
                                    </p>
                                    <p>
                                        Founded by <strong>Kamlesh Kumar Singh</strong>, our mission is simple: to bring the luxury of authentic Indian handlooms to the global stage, making it accessible, modern, and cherished.
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <Link href="/category/sarees" className="inline-flex items-center gap-2 text-primary font-medium hover:gap-4 transition-all group">
                                        Explore our Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </FadeIn>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
