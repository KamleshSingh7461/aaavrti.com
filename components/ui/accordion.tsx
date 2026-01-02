'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const AccordionContext = React.createContext<{
    value?: string | string[];
    onValueChange?: (value: string) => void;
}>({});

interface AccordionProps {
    children: React.ReactNode;
    className?: string;
    type?: 'single' | 'multiple';
    value?: string | string[];
    defaultValue?: string | string[];
    onValueChange?: (value: string | string[]) => void;
    collapsible?: boolean;
}

export function Accordion({ children, className, type = 'single', value: controlledValue, onValueChange, defaultValue }: AccordionProps) {
    const [value, setValue] = React.useState<string | string[]>(defaultValue || (type === 'multiple' ? [] : ''));

    const handleValueChange = (itemValue: string) => {
        if (type === 'multiple') {
            const currentValues = Array.isArray(controlledValue !== undefined ? controlledValue : value)
                ? (controlledValue !== undefined ? controlledValue : value) as string[]
                : [];

            const newValues = currentValues.includes(itemValue)
                ? currentValues.filter(v => v !== itemValue)
                : [...currentValues, itemValue];

            setValue(newValues);
            (onValueChange as any)?.(newValues);
        } else {
            // Single mode
            const currentValue = controlledValue !== undefined ? controlledValue : value;
            const newValue = currentValue === itemValue ? '' : itemValue;
            setValue(newValue);
            (onValueChange as any)?.(newValue);
        }
    };

    return (
        <AccordionContext.Provider value={{ value: controlledValue !== undefined ? controlledValue : value, onValueChange: handleValueChange }}>
            <div className={className}>{children}</div>
        </AccordionContext.Provider>
    );
}

const AccordionItemContext = React.createContext<{ value: string }>({ value: '' });

export function AccordionItem({ children, value, className }: { children: React.ReactNode; value: string; className?: string }) {
    return (
        <AccordionItemContext.Provider value={{ value }}>
            <div className={cn("border-b", className)}>
                {children}
            </div>
        </AccordionItemContext.Provider>
    );
}

export function AccordionTrigger({ children, className, ...props }: { children: React.ReactNode; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { value: selectedValue, onValueChange } = React.useContext(AccordionContext);
    const { value } = React.useContext(AccordionItemContext);

    // Check if open
    const isOpen = Array.isArray(selectedValue)
        ? selectedValue.includes(value)
        : selectedValue === value;

    return (
        <h3 className="flex">
            <button
                type="button"
                onClick={() => onValueChange?.(value)}
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

export function AccordionContent({ children, className, ...props }: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
    const { value: selectedValue } = React.useContext(AccordionContext);
    const { value } = React.useContext(AccordionItemContext);

    const isOpen = Array.isArray(selectedValue)
        ? selectedValue.includes(value)
        : selectedValue === value;

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
