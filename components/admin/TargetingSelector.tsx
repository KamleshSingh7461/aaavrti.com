
'use client';

import { useState, useEffect } from 'react';
import { getCategories } from '@/actions/category-actions';

interface TargetingSelectorProps {
    type: string;
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}

export function TargetingSelector({ type, selectedIds, onChange }: TargetingSelectorProps) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (type === 'CATEGORY') {
            loadCategories();
        }
    }, [type]);

    const loadCategories = async () => {
        setLoading(true);
        // This is a placeholder for actual category loading logic
        setLoading(false);
    };

    if (type === 'ALL') return null;

    return (
        <div className="space-y-4 border rounded-md p-4 bg-secondary/5">
            <h4 className="font-medium text-sm">Targeting: {type}</h4>

            {type === 'CATEGORY' && (
                <div className="text-sm text-muted-foreground">
                    <p>Enter Category IDs (comma separated):</p>
                    <input
                        type="text"
                        value={selectedIds.join(', ')}
                        onChange={(e) => onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        className="w-full mt-2 p-2 border rounded"
                        placeholder="cat-uuid-1, cat-uuid-2"
                    />
                </div>
            )}

            {type === 'PRODUCT' && (
                <div className="text-sm text-muted-foreground">
                    <p>Enter Product IDs (comma separated):</p>
                    <input
                        type="text"
                        value={selectedIds.join(', ')}
                        onChange={(e) => onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        className="w-full mt-2 p-2 border rounded"
                        placeholder="prod-uuid-1, prod-uuid-2"
                    />
                </div>
            )}
        </div>
    );
}
