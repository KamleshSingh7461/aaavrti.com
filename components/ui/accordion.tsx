'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const AccordionContext = React.createContext<{
    value?: string;
    onValueChange?: (value: string) => void;
}>({});

interface AccordionProps {
    children: React.ReactNode;
    className?: string;
    type?: 'single' | 'multiple';
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    collapsible?: boolean;
}

export function Accordion({ children, className, value: controlledValue, onValueChange, defaultValue }: AccordionProps) {
    const [value, setValue] = React.useState(defaultValue || '');

    const handleValueChange = (newValue: string) => {
        const finalValue = newValue === value ? '' : newValue;
        setValue(finalValue);
        onValueChange?.(finalValue);
    };

    return (
        <AccordionContext.Provider value={{ value: controlledValue !== undefined ? controlledValue : value, onValueChange: handleValueChange }}>
            <div className={className}>{children}</div>
        </AccordionContext.Provider>
    );
}

export function AccordionItem({ children, value, className }: { children: React.ReactNode; value: string; className?: string }) {
    return (
        <div className={cn("border-b", className)}>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, { ...child.props, value } as any);
                }
                return child;
            })}
        </div>
    );
}

export function AccordionTrigger({ children, className, value, ...props }: { children: React.ReactNode; className?: string; value?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { value: selectedValue, onValueChange } = React.useContext(AccordionContext);
    const isOpen = selectedValue === value;

    return (
        <h3 className="flex">
            <button
                type="button"
                onClick={() => onValueChange?.(value!)}
                className={cn(
                    "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline md:text-sm",
                    className
                )}
                {...props}
            >
                {children}
                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>
        </h3>
    );
}

export function AccordionContent({ children, className, value, ...props }: { children: React.ReactNode; className?: string; value?: string } & React.HTMLAttributes<HTMLDivElement>) {
    const { value: selectedValue } = React.useContext(AccordionContext);
    const isOpen = selectedValue === value;

    return (
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                >
                    <div className={cn("pb-4 pt-0", className)} {...props}>
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
