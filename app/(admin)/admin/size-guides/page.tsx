import { getSizeGuides, deleteSizeGuide } from '@/actions/size-guide-actions';
import Link from 'next/link';
import { Plus, Edit, Trash2, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming button component exists or use raw
import { revalidatePath } from 'next/cache';

export default async function SizeGuidesPage() {
    const { guides } = await getSizeGuides();

    async function handleDelete(id: string) {
        'use server';
        await deleteSizeGuide(id);
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Size Guides</h1>
                    <p className="text-muted-foreground">Manage size charts for your products.</p>
                </div>
                <Link href="/admin/size-guides/new">
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium">
                        <Plus className="h-4 w-4" />
                        Create New Guide
                    </button>
                </Link>
            </div>

            <div className="border border-border rounded-lg overflow-hidden shadow-sm bg-card">
                {guides && guides.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead className="bg-secondary/40 border-b border-border text-left">
                            <tr>
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Category Linked</th>
                                <th className="p-4 font-medium">Rows</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {guides.map((guide: any) => (
                                <tr key={guide._id} className="hover:bg-secondary/10 group transition-colors">
                                    <td className="p-4 font-medium flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-md text-primary">
                                            <Ruler className="h-4 w-4" />
                                        </div>
                                        {guide.name}
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {guide.categoryId || 'General'}
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {guide.measurements?.length || 0} sizes defined
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${guide.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {guide.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/size-guides/${guide._id}`}>
                                                <button className="p-2 hover:bg-secondary rounded-md transition-colors" title="Edit">
                                                    <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                </button>
                                            </Link>

                                            {/* Server Action Form for Delete */}
                                            <form action={handleDelete.bind(null, guide._id)}>
                                                <button className="p-2 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                                                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
                        <div className="p-4 bg-secondary/50 rounded-full">
                            <Ruler className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">No size guides found</p>
                            <p className="text-sm">Create your first size chart to help customers find their fit.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
