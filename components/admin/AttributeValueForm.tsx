'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { createAttributeValue, updateAttributeValue } from '@/actions/attribute-actions';
import { ColorPicker } from './ColorPicker';

interface AttributeValueFormProps {
    attributeId: string;
    attributeType: string;
    value?: {
        id: string;
        name: string;
        value: string;
    } | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function AttributeValueForm({ attributeId, attributeType, value, onClose, onSuccess }: AttributeValueFormProps) {
    const [name, setName] = useState(value?.name || '');
    const [valueStr, setValueStr] = useState(value?.value || (attributeType === 'COLOR' ? '#000000' : ''));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isEdit = !!value;
    const isColor = attributeType === 'COLOR';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('value', valueStr);

        try {
            const result = isEdit
                ? await updateAttributeValue(value.id, formData)
                : await createAttributeValue(attributeId, formData);

            if (result.error) {
                setError(result.error);
            } else {
                onSuccess();
                onClose();
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold">
                        {isEdit ? 'Edit' : 'Add'} {isColor ? 'Color' : 'Value'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-md transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder={isColor ? "e.g., Crimson Red" : "e.g., Medium"}
                        />
                    </div>

                    {/* Value - Color Picker or Text Input */}
                    {isColor ? (
                        <ColorPicker
                            value={valueStr}
                            onChange={setValueStr}
                            label="Color"
                        />
                    ) : (
                        <div>
                            <label htmlFor="value" className="block text-sm font-medium mb-1.5">
                                Value <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="value"
                                value={valueStr}
                                onChange={(e) => setValueStr(e.target.value)}
                                required
                                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g., M"
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
