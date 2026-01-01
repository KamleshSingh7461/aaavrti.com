
'use client';

import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode, useRef } from 'react';

type MotionProps = {
    children: ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
}

// 1. Basic Fade In
export const FadeIn = ({ children, className, delay = 0, duration = 0.5 }: MotionProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration, delay, ease: 'easeOut' }}
        className={className}
    >
        {children}
    </motion.div>
);

// 2. Slide In From Left
export const SlideInFromLeft = ({ children, className, delay = 0 }: MotionProps) => (
    <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay, ease: 'easeOut' }}
        className={className}
    >
        {children}
    </motion.div>
);

// 3. Scale In
export const ScaleIn = ({ children, className, delay = 0 }: MotionProps) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay, ease: 'backOut' }}
        className={className}
    >
        {children}
    </motion.div>
);

// 4. Stagger Container
export const StaggerContainer = ({ children, className, staggerDelay = 0.1 }: { children: ReactNode, className?: string, staggerDelay?: number }) => (
    <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
            hidden: { opacity: 0 },
            show: {
                opacity: 1,
                transition: {
                    staggerChildren: staggerDelay
                }
            }
        }}
        className={className}
    >
        {children}
    </motion.div>
);

export const StaggerItem = ({ children, className }: { children: ReactNode, className?: string }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
        }}
        className={className}
    >
        {children}
    </motion.div>
);

// 5. Parallax Image
export const ParallaxImage = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

    return (
        <div ref={ref} className={cn("overflow-hidden", className)}>
            <motion.img
                src={src}
                alt={alt}
                style={{ y, scale }}
                className="w-full h-full object-cover"
            />
        </div>
    );
}

// 6. Reveal Text (Character by Character)
export const RevealText = ({ text, className, delay = 0 }: { text: string, className?: string, delay?: number }) => {
    const letters = Array.from(text);

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: delay }
        })
    };

    const child = {
        visible: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 12, stiffness: 100 } },
        hidden: { opacity: 0, y: 20, transition: { type: "spring" as const, damping: 12, stiffness: 100 } }
    };

    return (
        <motion.div
            style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", justifyContent: "center" }} // Flex wrap for handling long text
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={className}
        >
            {letters.map((letter, index) => (
                <motion.span variants={child} key={index} style={{ marginRight: letter === " " ? "0.25em" : "0" }}>
                    {letter === " " ? "\u00A0" : letter}
                </motion.span>
            ))}
        </motion.div>
    );
};
