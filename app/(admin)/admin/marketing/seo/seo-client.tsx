import { useState } from 'react';
import { PageMetaDTO, upsertPageMetadata, deletePageMetadata, trackSEORanking } from '@/actions/seo-actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Search, Plus, Save, Trash2, Globe, FileText,
    BarChart2, Settings, ExternalLink, RefreshCw
} from 'lucide-react';

interface SEOClientProps {
    metadata: PageMetaDTO[];
    rankings: any[];
}

export default function SEOClient({ metadata: initialMetadata, rankings: initialRankings }: SEOClientProps) {
    const [activeTab, setActiveTab] = useState<'meta' | 'rankings' | 'settings'>('meta');
    const [metadata, setMetadata] = useState(initialMetadata);
    const [rankings, setRankings] = useState(initialRankings);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // --- Meta Tag State ---
    const [editingMeta, setEditingMeta] = useState<Partial<PageMetaDTO> | null>(null);
    const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);

    // --- Ranking State ---
    const [newRanking, setNewRanking] = useState({ keyword: '', url: '', position: 0 });
    const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);

    // --- Handlers ---

    const handleSaveMeta = async () => {
        if (!editingMeta?.path || !editingMeta.title || !editingMeta.description) {
            toast.error("Path, Title, and Description are required");
            return;
        }
        setIsLoading(true);
        try {
            const res = await upsertPageMetadata({
                path: editingMeta.path,
                title: editingMeta.title,
                description: editingMeta.description,
                keywords: editingMeta.keywords,
                ogImage: editingMeta.ogImage,
                isSystem: editingMeta.isSystem
            });
            if (res.error) throw new Error(res.error);

            toast.success("Metadata saved successfully");
            setIsMetaModalOpen(false);
            setEditingMeta(null);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteMeta = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        setIsLoading(true);
        try {
            const res = await deletePageMetadata(id);
            if (res.error) throw new Error(res.error);
            toast.success("Deleted");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddRanking = async () => {
        if (!newRanking.keyword || !newRanking.url) {
            toast.error("Keyword and URL are required");
            return;
        }
        setIsLoading(true);
        try {
            const res = await trackSEORanking(newRanking.keyword, newRanking.position, newRanking.url);
            if (!res.success) throw new Error(res.error);

            toast.success("Ranking tracked");
            setIsRankingModalOpen(false);
            setNewRanking({ keyword: '', url: '', position: 0 });
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tabs Header */}
            <div className="flex border-b border-border">
                <button
                    onClick={() => setActiveTab('meta')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'meta'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Meta Tags
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('rankings')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'rankings'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <BarChart2 className="w-4 h-4" />
                        Rankings
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'settings'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Tools & settings
                    </div>
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'meta' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-medium">Page Meta Tags</h2>
                            <button
                                onClick={() => {
                                    setEditingMeta({ path: '/', title: '', description: '', isSystem: false });
                                    setIsMetaModalOpen(true);
                                }}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-primary/90"
                            >
                                <Plus className="w-4 h-4" /> Add Page
                            </button>
                        </div>

                        <div className="border border-border rounded-lg overflow-hidden bg-card">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="text-left p-3 font-medium">Path</th>
                                        <th className="text-left p-3 font-medium">Title</th>
                                        <th className="text-left p-3 font-medium">Description</th>
                                        <th className="text-right p-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metadata.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                                No metadata configured. Add your first page!
                                            </td>
                                        </tr>
                                    ) : (
                                        metadata.map((page) => (
                                            <tr key={page.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                                                <td className="p-3 font-mono text-xs">{page.path}</td>
                                                <td className="p-3 max-w-[200px] truncate" title={page.title}>{page.title}</td>
                                                <td className="p-3 max-w-[300px] truncate text-muted-foreground" title={page.description}>{page.description}</td>
                                                <td className="p-3 text-right space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingMeta(page);
                                                            setIsMetaModalOpen(true);
                                                        }}
                                                        className="p-1 hover:bg-muted rounded text-blue-500"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                    </button>
                                                    {!page.isSystem && (
                                                        <button
                                                            onClick={() => handleDeleteMeta(page.id)}
                                                            className="p-1 hover:bg-muted rounded text-destructive"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'rankings' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-medium">Keyword Rankings</h2>
                            <button
                                onClick={() => setIsRankingModalOpen(true)}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-primary/90"
                            >
                                <Plus className="w-4 h-4" /> Track Keyword
                            </button>
                        </div>
                        <div className="border border-border rounded-lg overflow-hidden bg-card">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="text-left p-3 font-medium">Keyword</th>
                                        <th className="text-left p-3 font-medium">Position</th>
                                        <th className="text-left p-3 font-medium">URL</th>
                                        <th className="text-right p-3 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rankings.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                                No rankings tracked yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        rankings.map((rank) => (
                                            <tr key={rank.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                                                <td className="p-3 font-medium">{rank.keyword}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${rank.position <= 3 ? 'bg-green-100 text-green-700' :
                                                        rank.position <= 10 ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        #{rank.position}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-xs text-muted-foreground truncate max-w-[200px]">{rank.url}</td>
                                                <td className="p-3 text-right text-xs text-muted-foreground">
                                                    {new Date(rank.date).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-card border border-border p-6 rounded-lg space-y-4">
                            <h3 className="font-medium flex items-center gap-2">
                                <Globe className="w-4 h-4" /> Sitemap & Robots
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center p-3 bg-secondary/10 rounded">
                                    <span>Sitemap XML</span>
                                    <a href="/sitemap.xml" target="_blank" className="text-blue-500 hover:underline flex items-center gap-1">
                                        View <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-secondary/10 rounded">
                                    <span>Robots.txt</span>
                                    <a href="/robots.txt" target="_blank" className="text-blue-500 hover:underline flex items-center gap-1">
                                        View <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                These files are automatically generated by Next.js based on your routes.
                            </p>
                        </div>

                        <div className="bg-card border border-border p-6 rounded-lg space-y-4">
                            <h3 className="font-medium flex items-center gap-2">
                                <Search className="w-4 h-4" /> Webmaster Tools
                            </h3>
                            <div className="space-y-4">
                                <a
                                    href="https://search.google.com/search-console"
                                    target="_blank"
                                    className="block p-3 border border-border rounded hover:bg-muted transition-colors"
                                >
                                    <div className="font-medium text-sm">Google Search Console</div>
                                    <div className="text-xs text-muted-foreground">Check indexing status and performance</div>
                                </a>
                                <a
                                    href="https://analytics.google.com/"
                                    target="_blank"
                                    className="block p-3 border border-border rounded hover:bg-muted transition-colors"
                                >
                                    <div className="font-medium text-sm">Google Analytics</div>
                                    <div className="text-xs text-muted-foreground">Detailed traffic analysis</div>
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Meta Modal */}
            {isMetaModalOpen && editingMeta && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border w-full max-w-lg rounded-lg shadow-lg p-6 space-y-4">
                        <h3 className="text-lg font-medium">{editingMeta.id ? 'Edit Meta Tags' : 'Add Meta Tags'}</h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium">Path</label>
                                <input
                                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                                    placeholder="/shop"
                                    value={editingMeta.path || ''}
                                    onChange={e => setEditingMeta({ ...editingMeta, path: e.target.value })}
                                    disabled={editingMeta.isSystem || (!!editingMeta.id)} // Disable path edit for existing
                                />
                                <p className="text-xs text-muted-foreground">Must start with /</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Page Title</label>
                                <input
                                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                                    placeholder="Casual Shirts for Men | Aaavrti"
                                    value={editingMeta.title || ''}
                                    onChange={e => setEditingMeta({ ...editingMeta, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm h-24"
                                    placeholder="Shop the latest collection..."
                                    value={editingMeta.description || ''}
                                    onChange={e => setEditingMeta({ ...editingMeta, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Keywords (Optional)</label>
                                <input
                                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                                    placeholder="shirts, casual, cotton"
                                    value={editingMeta.keywords || ''}
                                    onChange={e => setEditingMeta({ ...editingMeta, keywords: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setIsMetaModalOpen(false)}
                                className="px-4 py-2 text-sm hover:bg-muted rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveMeta}
                                disabled={isLoading}
                                className="bg-primary text-primary-foreground px-4 py-2 text-sm rounded hover:bg-primary/90 disabled:opacity-50"
                            >
                                {isLoading ? 'Saving...' : 'Save Meta Tags'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ranking Modal */}
            {isRankingModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border border-border w-full max-w-md rounded-lg shadow-lg p-6 space-y-4">
                        <h3 className="text-lg font-medium">Track Keyword Ranking</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium">Keyword</label>
                                <input
                                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                                    placeholder="casual shirts"
                                    value={newRanking.keyword}
                                    onChange={e => setNewRanking({ ...newRanking, keyword: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Target URL</label>
                                <input
                                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                                    placeholder="https://aaavrti.shop/shop/shirts"
                                    value={newRanking.url}
                                    onChange={e => setNewRanking({ ...newRanking, url: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Current Position</label>
                                <input
                                    type="number"
                                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                                    placeholder="1"
                                    value={newRanking.position}
                                    onChange={e => setNewRanking({ ...newRanking, position: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setIsRankingModalOpen(false)}
                                className="px-4 py-2 text-sm hover:bg-muted rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddRanking}
                                disabled={isLoading}
                                className="bg-primary text-primary-foreground px-4 py-2 text-sm rounded hover:bg-primary/90 disabled:opacity-50"
                            >
                                {isLoading ? 'Saving...' : 'Track'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
