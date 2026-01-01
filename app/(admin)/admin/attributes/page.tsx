'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Palette, Ruler, Type, Loader2 } from 'lucide-react';
import { getAttributes, deleteAttributeValue, initializeDefaultAttributes, type AttributeWithValues } from '@/actions/attribute-actions';
import { AttributeValueForm } from '@/components/admin/AttributeValueForm';

export default function AdminAttributesPage() {
    const [attributes, setAttributes] = useState<AttributeWithValues[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedAttribute, setSelectedAttribute] = useState<AttributeWithValues | null>(null);
    const [editingValue, setEditingValue] = useState<any>(null);
    const [initializing, setInitializing] = useState(false);

    const loadAttributes = async () => {
        setLoading(true);
        const data = await getAttributes();
        setAttributes(data);
        setLoading(false);
    };

    useEffect(() => {
        loadAttributes();
    }, []);

    const handleAddValue = (attribute: AttributeWithValues) => {
        setSelectedAttribute(attribute);
        setEditingValue(null);
        setShowForm(true);
    };

    const handleEditValue = (attribute: AttributeWithValues, value: any) => {
        setSelectedAttribute(attribute);
        setEditingValue(value);
        setShowForm(true);
    };

    const handleDeleteValue = async (valueId: string, valueName: string) => {
        if (!confirm(`Delete "${valueName}"?`)) return;

        const result = await deleteAttributeValue(valueId);
        if (result.error) {
            alert(result.error);
        } else {
            loadAttributes();
        }
    };

    const handleInitialize = async () => {
        if (!confirm('Initialize default attributes? This will add Colors, Sizes, Materials, and Tags.')) return;

        setInitializing(true);
        const result = await initializeDefaultAttributes();
        setInitializing(false);

        if (result.error) {
            alert(result.error);
        } else {
            loadAttributes();
        }
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setSelectedAttribute(null);
        setEditingValue(null);
    };

    const handleSuccess = () => {
        loadAttributes();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'COLOR': return Palette;
            case 'SIZE': return Ruler;
            default: return Type;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold font-heading">Attributes</h1>
                    <p className="text-sm text-muted-foreground">Manage global product options</p>
                </div>
                {attributes.length === 0 && (
                    <button
                        onClick={handleInitialize}
                        disabled={initializing}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                    >
                        {initializing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Initializing...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Initialize Defaults
                            </>
                        )}
                    </button>
                )}
            </div>

            {attributes.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">No attributes yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                        Click "Initialize Defaults" to add Colors, Sizes, Materials, and Tags
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {attributes.map((attribute) => {
                        const Icon = getIcon(attribute.type);
                        return (
                            <AttributeSection
                                key={attribute.id}
                                attribute={attribute}
                                icon={Icon}
                                onAddValue={() => handleAddValue(attribute)}
                                onEditValue={(value) => handleEditValue(attribute, value)}
                                onDeleteValue={handleDeleteValue}
                            />
                        );
                    })}
                </div>
            )}

            {/* Form Modal */}
            {showForm && selectedAttribute && (
                <AttributeValueForm
                    attributeId={selectedAttribute.id}
                    attributeType={selectedAttribute.type}
                    value={editingValue}
                    onClose={handleCloseForm}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}

interface AttributeSectionProps {
    attribute: AttributeWithValues;
    icon: any;
    onAddValue: () => void;
    onEditValue: (value: any) => void;
    onDeleteValue: (id: string, name: string) => void;
}

function AttributeSection({ attribute, icon: Icon, onAddValue, onEditValue, onDeleteValue }: AttributeSectionProps) {
    return (
        <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded text-primary">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-medium">{attribute.name}</h3>
                        <p className="text-xs text-muted-foreground">
                            {attribute.values.length} option{attribute.values.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onAddValue}
                    className="text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                >
                    + Add
                </button>
            </div>

            <div className="divide-y divide-border max-h-96 overflow-y-auto">
                {attribute.values.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        No values yet. Click "+ Add" to create one.
                    </div>
                ) : (
                    attribute.values.map((value) => (
                        <div
                            key={value.id}
                            className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                {attribute.type === 'COLOR' ? (
                                    <div
                                        className="h-8 w-8 rounded-full border border-border shadow-sm ring-2 ring-background"
                                        style={{ backgroundColor: value.value }}
                                    />
                                ) : (
                                    <div className="h-8 min-w-[32px] px-2 rounded-md border border-border bg-secondary flex items-center justify-center text-xs font-bold">
                                        {value.value}
                                    </div>
                                )}
                                <div>
                                    <div className="font-medium text-sm">{value.name}</div>
                                    <div className="text-xs text-muted-foreground font-mono">{value.value}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEditValue(value)}
                                    className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Edit2 className="h-3 w-3" />
                                </button>
                                <button
                                    onClick={() => onDeleteValue(value.id, value.name)}
                                    className="p-2 hover:bg-red-50 rounded text-muted-foreground hover:text-red-600 transition-colors"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
