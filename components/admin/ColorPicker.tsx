'use client';

import { useState, useEffect } from 'react';

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
    const [hexValue, setHexValue] = useState(value || '#000000');

    useEffect(() => {
        if (value) {
            setHexValue(value);
        }
    }, [value]);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setHexValue(newColor);
        onChange(newColor);
    };

    const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        let hex = e.target.value;
        // Ensure it starts with #
        if (!hex.startsWith('#')) {
            hex = '#' + hex;
        }
        setHexValue(hex);
        // Only call onChange if it's a valid hex color
        if (/^#[0-9A-F]{6}$/i.test(hex)) {
            onChange(hex);
        }
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium">
                    {label}
                </label>
            )}
            <div className="flex gap-3 items-center">
                {/* Color Picker Input */}
                <div className="relative">
                    <input
                        type="color"
                        value={hexValue}
                        onChange={handleColorChange}
                        className="h-12 w-12 rounded-md border-2 border-border cursor-pointer"
                        style={{ backgroundColor: hexValue }}
                    />
                </div>

                {/* Hex Input */}
                <div className="flex-1">
                    <input
                        type="text"
                        value={hexValue}
                        onChange={handleHexInput}
                        placeholder="#000000"
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                        maxLength={7}
                    />
                </div>

                {/* Preview Swatch */}
                <div className="flex items-center gap-2">
                    <div
                        className="h-12 w-12 rounded-md border-2 border-border shadow-sm"
                        style={{ backgroundColor: hexValue }}
                    />
                </div>
            </div>
            <p className="text-xs text-muted-foreground">
                Click the color box to pick a color, or enter a hex code
            </p>
        </div>
    );
}
