'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSizeGuide, updateSizeGuide } from '@/actions/size-guide-actions';
import { Save, ChevronLeft, Plus, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SizeGuideEditorClientProps {
    initialData?: any;
    categories: any[];
    isNew: boolean;
    id: string; // 'new' or actual ID
}

export default function SizeGuideEditorClient({ initialData, categories, isNew, id }: SizeGuideEditorClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState(initialData?.name || '');
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
    const [notes, setNotes] = useState<string[]>(initialData?.notes && initialData.notes.length > 0 ? initialData.notes : ['']);

    // Table State
    // Default columns if new: Size, Chest, Length
    const [columns, setColumns] = useState<string[]>(initialData?.columns || ['Size', 'Chest', 'Length']);

    // Default dummy measurements if new
    const defaultMeasurements = [
        { size: 'S', chest: '36', length: '28' },
        { size: 'M', chest: '38', length: '29' },
    ];
    const [measurements, setMeasurements] = useState<any[]>(initialData?.measurements || defaultMeasurements);

    const handleSave = async () => {
        if (!name) return alert('Name is required');
        setLoading(true);

        const data = {
            name,
            categoryId: categoryId || null,
            description,
            isActive,
            measurements: measurements,
            columns: columns,
            notes: notes.filter(n => n.trim() !== '')
        };

        const res = isNew
            ? await createSizeGuide(data)
            : await updateSizeGuide(id, data);

        setLoading(false);
        if (res.success) {
            toast.success('Size guide saved successfully');
            router.push('/admin/size-guides');
            router.refresh();
        } else {
            alert(res.error);
        }
    };

    // Table Helpers
    const addColumn = () => {
        const newColName = prompt('Enter new measurement name (e.g. Shoulder):');
        if (newColName) {
            if (columns.map(c => c.toLowerCase()).includes(newColName.toLowerCase())) {
                return alert('Column already exists');
            }
            setColumns([...columns, newColName]);
        }
    };

    const removeColumn = (colIndex: number) => {
        if (columns.length <= 1) return alert('At least one column is required');
        setColumns(columns.filter((_, i) => i !== colIndex));
    };

    const addRow = () => {
        setMeasurements([...measurements, {}]);
    };

    const removeRow = (rowIndex: number) => {
        setMeasurements(measurements.filter((_, i) => i !== rowIndex));
    };

    const updateCell = (rowIndex: number, colKey: string, value: string) => {
        const newData = [...measurements];
        newData[rowIndex] = { ...newData[rowIndex], [colKey.toLowerCase()]: value };
        setMeasurements(newData);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-full">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-2xl font-bold">{isNew ? 'Create Size Guide' : 'Edit Size Guide'}</h1>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {loading ? 'Saving...' : 'Save Guide'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Basic Info */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                        <h3 className="font-semibold border-b pb-2">Basic Details</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Guide Name</label>
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                                placeholder="e.g. Men's Kurtas"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Linked Category</label>
                            <select
                                value={categoryId}
                                onChange={e => setCategoryId(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                            >
                                <option value="">Select Category...</option>
                                {categories.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name_en}</option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground">Product pages in this category will auto-load this guide.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background h-24"
                                placeholder="Short description..."
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="status"
                                checked={isActive}
                                onChange={e => setIsActive(e.target.checked)}
                                className="h-4 w-4"
                            />
                            <label htmlFor="status" className="text-sm font-medium">Active</label>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                        <h3 className="font-semibold border-b pb-2">Notes & Tips</h3>
                        <div className="space-y-2">
                            {notes.map((note, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        value={note}
                                        onChange={e => {
                                            const newNotes = [...notes];
                                            newNotes[idx] = e.target.value;
                                            setNotes(newNotes);
                                        }}
                                        className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-sm"
                                        placeholder="e.g. Measure around chest..."
                                    />
                                    <button
                                        onClick={() => setNotes(notes.filter((_, i) => i !== idx))}
                                        className="p-2 text-muted-foreground hover:text-red-500"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => setNotes([...notes, ''])}
                                className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                            >
                                <Plus className="h-3 w-3" /> Add Note
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Matrix Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-lg p-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Measurements Table</h3>
                            <button
                                onClick={addColumn}
                                className="text-xs bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-md flex items-center gap-1 font-medium transition-colors"
                            >
                                <Plus className="h-3 w-3" /> Add Column
                            </button>
                        </div>

                        <div className="overflow-x-auto border border-border rounded-md">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-secondary/30">
                                        <th className="w-10 p-2 border-b border-r border-border"></th>
                                        {columns.map((col, idx) => (
                                            <th key={idx} className="p-2 border-b border-border min-w-[100px] text-left group relative">
                                                <div className="flex items-center justify-between">
                                                    <span>{col}</span>
                                                    <button
                                                        onClick={() => removeColumn(idx)}
                                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/10 rounded"
                                                        title="Remove Column"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {measurements.map((row, rowIdx) => (
                                        <tr key={rowIdx} className="hover:bg-secondary/5">
                                            <td className="p-2 border-r border-border text-center">
                                                <button
                                                    onClick={() => removeRow(rowIdx)}
                                                    className="text-muted-foreground hover:text-red-500"
                                                    title="Remove Row"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                            {columns.map((col, colIdx) => (
                                                <td key={colIdx} className="p-0 border-r border-border last:border-r-0">
                                                    <input
                                                        value={row[col.toLowerCase()] || ''}
                                                        onChange={e => updateCell(rowIdx, col, e.target.value)}
                                                        className="w-full h-full px-3 py-2 bg-transparent outline-none focus:bg-primary/5 transition-colors"
                                                        placeholder="-"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {measurements.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No rows added.
                                </div>
                            )}
                        </div>

                        <div className="mt-4">
                            <button
                                onClick={addRow}
                                className="w-full py-2 border-2 border-dashed border-border rounded-md text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="h-4 w-4" /> Add Measurement Row
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
