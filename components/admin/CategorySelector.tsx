'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronRight, ChevronDown, Check, Search, ChevronUp } from 'lucide-react';
import { Category } from '@/lib/types';
import { cn } from '@/lib/utils'; // Assuming you have a utility for class names

interface CategorySelectorProps {
    categories: Category[]; // Accepts flat list
    selectedId: string;
    onSelect: (categoryId: string) => void;
}

interface CategoryNode extends Category {
    children: CategoryNode[];
    level: number;
}

export function CategorySelector({ categories, selectedId, onSelect }: CategorySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    // Build Tree safely using useMemo
    const tree = useMemo(() => {
        const categoryMap = new Map<string, CategoryNode>();
        const roots: CategoryNode[] = [];

        // 1. Initialize nodes
        categories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [], level: 0 });
        });

        // 2. Build Hierarchy
        categories.forEach(cat => {
            const node = categoryMap.get(cat.id)!;
            if (cat.parentId && categoryMap.has(cat.parentId)) {
                const parent = categoryMap.get(cat.parentId)!;
                node.level = parent.level + 1;
                parent.children.push(node);
            } else {
                roots.push(node);
            }
        });

        // 3. Sort (by sortOrder or name)
        const sortNodes = (nodes: CategoryNode[]) => {
            nodes.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.name_en.localeCompare(b.name_en));
            nodes.forEach(node => sortNodes(node.children));
        };
        sortNodes(roots);

        return roots;
    }, [categories]);

    // Auto-expand path to selected category
    useEffect(() => {
        if (selectedId && categories.length > 0) {
            const expandPath = new Set<string>();
            let current = categories.find(c => c.id === selectedId);
            while (current && current.parentId) {
                expandPath.add(current.parentId);
                const parentId = current.parentId; // Store to avoid TS error
                current = categories.find(c => c.id === parentId);
            }
            setExpanded(prev => {
                const next = new Set(prev);
                expandPath.forEach(id => next.add(id));
                return next;
            });
        }
    }, [selectedId, categories]);

    // Find selected category name for display
    const selectedCategory = categories.find(c => c.id === selectedId);

    // Filter logic for search
    // If searching, we might show a flat list or filtered tree. Flat list is easier for search.
    const filteredFlatList = useMemo(() => {
        if (!searchTerm) return [];
        return categories.filter(c =>
            c.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.name_hi && c.name_hi.includes(searchTerm))
        );
    }, [categories, searchTerm]);

    const toggleExpand = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newExpanded = new Set(expanded);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpanded(newExpanded);
    };

    const handleSelect = (id: string) => {
        onSelect(id);
        setIsOpen(false);
    };

    // Recursive Renderer
    const renderNode = (node: CategoryNode) => {
        const isExpanded = expanded.has(node.id);
        const isSelected = node.id === selectedId;
        const hasChildren = node.children.length > 0;

        return (
            <div key={node.id} className="select-none">
                <div
                    className={cn(
                        "flex items-center px-2 py-1.5 hover:bg-secondary/50 rounded-md cursor-pointer transition-colors",
                        isSelected && "bg-primary/10 text-primary font-medium"
                    )}
                    style={{ paddingLeft: `${(node.level * 16) + 8}px` }}
                    onClick={() => handleSelect(node.id)}
                >
                    <button
                        type="button"
                        onClick={(e) => hasChildren && toggleExpand(e, node.id)}
                        className={cn(
                            "p-0.5 rounded-sm mr-1.5 hover:bg-secondary transition-colors",
                            !hasChildren && "invisible"
                        )}
                    >
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>

                    <span className="flex-1 truncate text-sm">
                        {node.name_en}
                        {node.name_hi && <span className="text-muted-foreground ml-1 text-xs">({node.name_hi})</span>}
                    </span>

                    {isSelected && <Check className="h-4 w-4 ml-2" />}
                </div>

                {hasChildren && isExpanded && (
                    <div className="border-l border-border/40 ml-[15px]">
                        {node.children.map(renderNode)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="relative w-full">
            {/* Trigger Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-background border border-border rounded-md text-sm cursor-pointer hover:border-primary/50 focus:ring-2 focus:ring-primary transition-all"
            >
                <span className={!selectedCategory ? "text-muted-foreground" : ""}>
                    {selectedCategory ? selectedCategory.name_en : "Select Category..."}
                </span>
                <div className="flex items-center text-muted-foreground">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
            </div>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    <div className="absolute top-full left-0 w-full mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-80 flex flex-col animate-in fade-in-0 zoom-in-95 duration-100">
                        {/* Search Bar */}
                        <div className="p-2 border-b border-border sticky top-0 bg-background z-10">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-secondary/30 border border-transparent rounded-md focus:outline-none focus:bg-background focus:border-primary transition-colors"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-1.5">
                            {searchTerm ? (
                                filteredFlatList.length > 0 ? (
                                    filteredFlatList.map(cat => (
                                        <div
                                            key={cat.id}
                                            onClick={() => handleSelect(cat.id)}
                                            className={cn(
                                                "flex items-center px-3 py-2 hover:bg-secondary/50 rounded-md cursor-pointer text-sm",
                                                cat.id === selectedId && "bg-primary/10 text-primary"
                                            )}
                                        >
                                            <span className="flex-1">{cat.name_en}</span>
                                            {cat.id === selectedId && <Check className="h-4 w-4" />}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-xs text-muted-foreground">
                                        No categories found.
                                    </div>
                                )
                            ) : (
                                tree.length > 0 ? (
                                    tree.map(renderNode)
                                ) : (
                                    <div className="p-4 text-center text-xs text-muted-foreground">
                                        No categories available.
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                    {/* Backdrop to close */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                </>
            )}
        </div>
    );
}
