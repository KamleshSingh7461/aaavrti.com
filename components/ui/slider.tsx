'use client';

import * as React from 'react';

interface SliderProps {
    min: number;
    max: number;
    step: number;
    value: [number, number];
    onValueChange: (value: [number, number]) => void;
    className?: string;
}

export function Slider({ min, max, step, value, onValueChange, className = '' }: SliderProps) {
    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMin = Number(e.target.value);
        if (newMin <= value[1]) {
            onValueChange([newMin, value[1]]);
        }
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = Number(e.target.value);
        if (newMax >= value[0]) {
            onValueChange([value[0], newMax]);
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value[0]}
                onChange={handleMinChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value[1]}
                onChange={handleMaxChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
        </div>
    );
}
