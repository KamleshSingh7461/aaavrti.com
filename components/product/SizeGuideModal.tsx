'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface SizeGuideModalProps {
    category?: string;
    onClose: () => void;
}

export function SizeGuideModal({ category = 'sarees', onClose }: SizeGuideModalProps) {
    const [activeTab, setActiveTab] = useState(category);

    const sizeCharts = {
        sarees: {
            title: 'Saree Size Guide',
            measurements: [
                { size: 'Standard', length: '5.5-6 meters', blouse: 'Unstitched (0.8m)' },
            ],
            notes: [
                'Standard saree length is 5.5 to 6 meters',
                'Blouse piece is unstitched and measures approximately 0.8 meters',
                'Can be draped in various styles to fit all body types',
            ]
        },
        kurtas: {
            title: 'Kurta Size Guide',
            measurements: [
                { size: 'XS', bust: '32"', waist: '26"', hip: '34"', length: '42-44"' },
                { size: 'S', bust: '34"', waist: '28"', hip: '36"', length: '42-44"' },
                { size: 'M', bust: '36"', waist: '30"', hip: '38"', length: '44-46"' },
                { size: 'L', bust: '38"', waist: '32"', hip: '40"', length: '44-46"' },
                { size: 'XL', bust: '40"', waist: '34"', hip: '42"', length: '46-48"' },
                { size: 'XXL', bust: '42"', waist: '36"', hip: '44"', length: '46-48"' },
            ],
            notes: [
                'All measurements are in inches',
                'Bust: Measure around the fullest part',
                'Waist: Measure around the natural waistline',
                'Hip: Measure around the fullest part of hips',
                'Length: From shoulder to hem',
            ]
        },
        lehenga: {
            title: 'Lehenga Size Guide',
            measurements: [
                { size: 'XS', waist: '26"', hip: '34"', length: '40-42"' },
                { size: 'S', waist: '28"', hip: '36"', length: '40-42"' },
                { size: 'M', waist: '30"', hip: '38"', length: '40-42"' },
                { size: 'L', waist: '32"', hip: '40"', length: '42-44"' },
                { size: 'XL', waist: '34"', hip: '42"', length: '42-44"' },
                { size: 'XXL', waist: '36"', hip: '44"', length: '42-44"' },
            ],
            notes: [
                'Waist: Measure where you want the lehenga to sit',
                'Hip: Measure around the fullest part',
                'Length: From waist to floor (including heels)',
                'Most lehengas have adjustable drawstrings',
            ]
        },
        blouse: {
            title: 'Blouse Size Guide',
            measurements: [
                { size: 'XS', bust: '32"', shoulder: '14"', length: '14-15"' },
                { size: 'S', bust: '34"', shoulder: '14.5"', length: '14-15"' },
                { size: 'M', bust: '36"', shoulder: '15"', length: '15-16"' },
                { size: 'L', bust: '38"', shoulder: '15.5"', length: '15-16"' },
                { size: 'XL', bust: '40"', shoulder: '16"', length: '16-17"' },
                { size: 'XXL', bust: '42"', shoulder: '16.5"', length: '16-17"' },
            ],
            notes: [
                'Bust: Measure around the fullest part',
                'Shoulder: From shoulder point to shoulder point',
                'Length: From shoulder to bottom hem',
                'For custom stitching, please contact us',
            ]
        },
    };

    const tabs = [
        { key: 'sarees', label: 'Sarees' },
        { key: 'kurtas', label: 'Kurtas' },
        { key: 'lehenga', label: 'Lehengas' },
        { key: 'blouse', label: 'Blouses' },
    ];

    const currentChart = sizeCharts[activeTab as keyof typeof sizeCharts];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
            <div className="bg-background rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-2xl font-serif">Size Guide</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.key
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    <h3 className="text-lg font-semibold mb-4">{currentChart.title}</h3>

                    {/* Size Table */}
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-muted">
                                    {Object.keys(currentChart.measurements[0]).map((key) => (
                                        <th
                                            key={key}
                                            className="px-4 py-3 text-left text-sm font-semibold capitalize border border-border"
                                        >
                                            {key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {currentChart.measurements.map((row, index) => (
                                    <tr key={index} className="hover:bg-muted/50">
                                        {Object.values(row).map((value, i) => (
                                            <td key={i} className="px-4 py-3 text-sm border border-border">
                                                {value}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* How to Measure */}
                    <div className="bg-muted/30 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold mb-3">How to Measure</h4>
                        <ul className="space-y-2">
                            {currentChart.notes.map((note, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{note}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Additional Tips */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 text-primary">Need Help?</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                            If you're between sizes, we recommend sizing up for a more comfortable fit.
                            For custom measurements or alterations, please contact our customer support.
                        </p>
                        <a
                            href="/contact"
                            className="text-sm text-primary hover:underline font-medium"
                        >
                            Contact Support →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
