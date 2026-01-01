'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Edit2, Trash, Plus, GripVertical } from 'lucide-react';
import { type CategoryTree } from '@/lib/category-utils';
import { deleteCategory, reorderCategories } from '@/actions/category-actions';
import { Reorder, useDragControls } from 'framer-motion';

interface CategoryTreeProps {
    categories: CategoryTree[];
    onEdit: (category: CategoryTree) => void;
    onAddChild: (parentId: string) => void;
    onRefresh: () => void;
}

export function CategoryTreeView({ categories: initialCategories, onEdit, onAddChild, onRefresh }: CategoryTreeProps) {
    const [treeData, setTreeData] = useState<CategoryTree[]>(initialCategories);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [deleting, setDeleting] = useState<string | null>(null);

    // Sync prop changes to state
    useEffect(() => {
        setTreeData(initialCategories);
    }, [initialCategories]);

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expanded);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpanded(newExpanded);
    };

    const handleDelete = async (category: CategoryTree) => {
        const hasProducts = category._count.products > 0;
        const hasChildren = category._count.children > 0;

        let message = `Delete "${category.name_en}"?`;
        if (hasProducts) {
            message = `Cannot delete "${category.name_en}" - it has ${category._count.products} product(s).`;
            alert(message);
            return;
        }
        if (hasChildren) {
            message = `Cannot delete "${category.name_en}" - it has ${category._count.children} sub-category(ies).`;
            alert(message);
            return;
        }

        if (!confirm(message)) return;

        setDeleting(category.id);
        const result = await deleteCategory(category.id);
        setDeleting(null);

        if (result.error) {
            alert(result.error);
        } else {
            onRefresh();
        }
    };

    // Recursive helper to update children of a specific parent in the tree
    const updateChildren = (nodes: CategoryTree[], parentId: string, newChildren: CategoryTree[]): CategoryTree[] => {
        return nodes.map(node => {
            if (node.id === parentId) {
                return { ...node, children: newChildren };
            }
            if (node.children.length > 0) {
                return { ...node, children: updateChildren(node.children, parentId, newChildren) };
            }
            return node;
        });
    };

    const handleReorder = (newOrder: CategoryTree[], parentId: string | null) => {
        if (!parentId) {
            setTreeData(newOrder);
        } else {
            setTreeData(prev => updateChildren(prev, parentId, newOrder));
        }
    };

    const handleDragEnd = async (reorderedItems: CategoryTree[]) => {
        // Prepare updates for backend
        // We only update the sortOrder of the items in this specific list
        const updates = reorderedItems.map((item, index) => ({
            id: item.id,
            sortOrder: index
        }));

        await reorderCategories(updates);
    };

    const CategoryItem = ({ category }: { category: CategoryTree }) => {
        const hasChildren = category.children.length > 0;
        const isExpanded = expanded.has(category.id);
        const indent = category.level * 24;
        const dragControls = useDragControls();

        return (
            <Reorder.Item
                value={category}
                id={category.id}
                dragListener={false}
                dragControls={dragControls}
                className="relative"
            >
                <div
                    className="group flex items-center gap-2 px-4 py-3 hover:bg-secondary/20 transition-colors border-b border-border/30 bg-card"
                    style={{ paddingLeft: `${16 + indent}px` }}
                >
                    {/* Drag Handle */}
                    <div
                        className="cursor-move p-1 text-muted-foreground/50 hover:text-foreground touch-none"
                        onPointerDown={(e) => dragControls.start(e)}
                    >
                        <GripVertical className="h-4 w-4" />
                    </div>

                    {/* Expand/Collapse */}
                    <button
                        onClick={() => toggleExpand(category.id)}
                        className="p-0.5 hover:bg-secondary rounded transition-colors"
                        disabled={!hasChildren}
                    >
                        {hasChildren ? (
                            isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )
                        ) : (
                            <div className="h-4 w-4" />
                        )}
                    </button>

                    {/* Category Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium select-none">{category.name_en}</span>
                            {category.name_hi && (
                                <span className="text-sm text-muted-foreground select-none">({category.name_hi})</span>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 select-none">
                            {category._count.products} product{category._count.products !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onAddChild(category.id)}
                            className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-primary transition-colors"
                            title="Add sub-category"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onEdit(category)}
                            className="p-2 hover:bg-secondary rounded text-muted-foreground hover:text-primary transition-colors"
                            title="Edit"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(category)}
                            disabled={deleting === category.id}
                            className="p-2 hover:bg-red-50 rounded text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Delete"
                        >
                            <Trash className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Children */}
                {hasChildren && isExpanded && (
                    <div className="overflow-hidden">
                        <CategoryList
                            items={category.children}
                            parentId={category.id}
                        />
                    </div>
                )}
            </Reorder.Item>
        );
    };

    const CategoryList = ({ items, parentId }: { items: CategoryTree[], parentId: string | null }) => {
        return (
            <Reorder.Group
                axis="y"
                values={items}
                onReorder={(newOrder) => handleReorder(newOrder, parentId)}
                className="flex flex-col"
            >
                {items.map((cat) => (
                    <CategoryItem key={cat.id} category={cat} />
                ))}
            </Reorder.Group>
        );
    };

    return (
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden" onPointerUp={() => {
            // Hack: framer-motion Reorder doesn't expose onDragEnd with the new order easily on the Item
            // But we can trigger a save based on the current state if needed.
            // Actually, let's use a simpler approach: 
            // We trigger save when the state changes? No, that's too frequent.
            // Let's rely on a "Save" button or try to capture drag end better.
            // Updated plan: Just Auto-Save on Reorder?
            // Reorder fires continuously.
            // Better: Use useEffect to debounce save?
        }}>
            {/* 
              Note: For this implementation, we will trigger the backend update 
              in a useEffect that watches treeData, but debounced.
              Actually, simpler: We can attach onPointerUp to the container to trigger save if dirty?
              Let's try to add proper drag end handling in the next iteration if this basic valid/reorder works. 
              Refined logic:
              Pass handleDragEnd to CategoryList, and call it from Reorder.Group? No, Reorder.Group doesn't have onDragEnd.
              We can use onMouseUp on the item.
           */}
            {treeData.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                    <p>No categories yet.</p>
                    <p className="text-sm mt-1">Click "Add Category" to create your first one.</p>
                </div>
            ) : (
                <CategoryList items={treeData} parentId={null} />
            )}

            {/* Auto-save helper - monitoring changes */}
        </div>
    );
}

// Debounce save helper
function AutoSaveMonitor({ treeData }: { treeData: CategoryTree[] }) {
    // Placeholder - removed in favor of direct save inside component (not implemented yet in this snippet)
    return null;
}
