'use client';

import { useState, useEffect } from 'react'; // Added useEffect
import { X } from 'lucide-react';

interface SizeGuideModalProps {
    categoryId: string;
    onClose: () => void;
}

export function SizeGuideModal({ categoryId, onClose }: SizeGuideModalProps) {
    const [guide, setGuide] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchGuide() {
            try {
                // Dynamically import action to avoid server-action build issues in client components sometimes
                const { getSizeGuideByCategory } = await import('@/actions/size-guide-actions');
                const res = await getSizeGuideByCategory(categoryId);
                if (res) {
                    setGuide(res);
                } else {
                    setError(true);
                }
            } catch (e) {
                console.error(e);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        if (categoryId) {
            fetchGuide();
        } else {
            setLoading(false);
            setError(true);
        }
    }, [categoryId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
            <div className="bg-background rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
                    <h2 className="text-2xl font-serif">Size Guide</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : error || !guide ? (
                        <div className="text-center p-8 space-y-4">
                            <p className="text-muted-foreground">Size guide not available for this product.</p>
                            <button onClick={onClose} className="text-primary hover:underline text-sm">Close</button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-semibold mb-2">{guide.name}</h3>
                                {guide.description && <p className="text-muted-foreground text-sm">{guide.description}</p>}
                            </div>

                            {/* Dynamic Table */}
                            <div className="overflow-x-auto border border-border rounded-lg">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-secondary/30">
                                            {guide.columns.map((col: string, idx: number) => (
                                                <th key={idx} className="p-3 text-left font-semibold border-b border-border min-w-[80px]">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {guide.measurements.map((row: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-secondary/5">
                                                {guide.columns.map((col: string, cIdx: number) => (
                                                    <td key={cIdx} className="p-3">
                                                        {row[col.toLowerCase()] || '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Notes */}
                            {guide.notes && guide.notes.length > 0 && (
                                <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
                                    <h4 className="font-semibold text-sm">Measurement Tips</h4>
                                    <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                                        {guide.notes.map((note: string, i: number) => (
                                            <li key={i}>{note}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
