
'use client';

import { ArrowLeft, Save, Upload, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminAddProductPage() {
    const [selectedColors, setSelectedColors] = useState(['#DC143C']);
    const [selectedSizes, setSelectedSizes] = useState(['Free Size']);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Details Header */}
            <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-30 py-4 border-b border-border -mx-6 px-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold font-heading">Add New Product</h1>
                        <p className="text-sm text-muted-foreground">Draft</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-secondary transition-colors">
                        Save Draft
                    </button>
                    <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Publish Product
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <Section title="Basic Information">
                        <div className="space-y-4">
                            <InputGroup label="Product Name" placeholder="e.g. Banarasi Silk Saree" />
                            <InputGroup label="Slug" placeholder="e.g. banarasi-silk-saree" />
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea className="w-full h-32 bg-background border border-border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Product details..." />
                            </div>
                        </div>
                    </Section>

                    {/* Media */}
                    <Section title="Product Media">
                        <div className="border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center justify-center text-center hover:bg-secondary/20 transition-colors cursor-pointer">
                            <div className="bg-secondary p-4 rounded-full mb-4">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="font-medium">Upload Images</h3>
                            <p className="text-xs text-muted-foreground mt-1">Drag & drop or click to upload</p>
                        </div>
                    </Section>

                    {/* Variants */}
                    <Section title="Variants & Attributes">
                        <div className="space-y-6">
                            {/* Colors */}
                            <div>
                                <label className="text-sm font-medium mb-3 block">Colors</label>
                                <div className="flex flex-wrap gap-3">
                                    {['#DC143C', '#4169E1', '#50C878', '#FFD700', '#FFFFF0', '#000000'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color])}
                                            className={`h-8 w-8 rounded-full border relative transition-all ${selectedColors.includes(color) ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'border-border opacity-70 hover:opacity-100 hover:scale-110'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                    <button className="h-8 w-8 rounded-full border border-dashed border-border flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground">
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Sizes */}
                            <div>
                                <label className="text-sm font-medium mb-3 block">Sizes</label>
                                <div className="flex flex-wrap gap-2">
                                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])}
                                            className={`px-3 py-1.5 rounded-md text-sm border transition-all ${selectedSizes.includes(size)
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-background text-muted-foreground border-border hover:bg-secondary'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Section>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <Section title="Organization">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                                    <option>Sarees</option>
                                    <option>Mens</option>
                                    <option>Accessories</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tags</label>
                                <input type="text" placeholder="e.g. New, Bestseller" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                            </div>
                        </div>
                    </Section>

                    <Section title="Pricing & Inventory">
                        <div className="space-y-4">
                            <InputGroup label="Base Price (₹)" placeholder="0.00" type="number" />
                            <InputGroup label="Compare at Price" placeholder="0.00" type="number" />
                            <InputGroup label="SKU" placeholder="PROD-001" />
                            <InputGroup label="Quantity" placeholder="0" type="number" />
                        </div>
                    </Section>
                </div>

            </div>
        </div>
    );
}

function Section({ title, children }: any) {
    return (
        <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-4 border-b border-border font-medium bg-secondary/10">
                {title}
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    )
}

function InputGroup({ label, ...props }: any) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <input
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                {...props}
            />
        </div>
    )
}
