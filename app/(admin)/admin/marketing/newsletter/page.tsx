'use client';

import { Mail, Search, Trash2, UserCheck, UserX, Loader2, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSubscribers, toggleSubscriberStatus, deleteSubscriber, sendNewsletter } from '@/actions/newsletter-actions';
import { toast } from 'sonner';

export default function NewsletterPage() {
    const [activeTab, setActiveTab] = useState<'list' | 'compose'>('list');
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');

    // Compose state
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);

    const loadSubscribers = async () => {
        setLoading(true);
        const data = await getSubscribers({
            search: searchTerm,
            status: statusFilter
        });
        setSubscribers(data);
        setLoading(false);
    };

    useEffect(() => {
        if (activeTab === 'list') {
            const timer = setTimeout(() => {
                loadSubscribers();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [searchTerm, statusFilter, activeTab]);

    const handleSendNewsletter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !content) return;

        const activeSubscribers = subscribers.filter(s => s.isActive);
        if (activeSubscribers.length === 0 && subscribers.length > 0) {
            toast.error('No active subscribers to send to.');
            return;
        }

        setIsSending(true);
        const toastId = toast.loading('Sending newsletter to all active subscribers...');

        try {
            const result = await sendNewsletter(subject, content);
            if (result.success) {
                toast.success(`Newsletter sent successfully to ${result.count} subscribers!`, { id: toastId });
                setSubject('');
                setContent('');
                setActiveTab('list');
            } else {
                toast.error(result.error || 'Failed to send newsletter.', { id: toastId });
            }
        } catch (error) {
            toast.error('Something went wrong.', { id: toastId });
        } finally {
            setIsSending(false);
        }
    };

    const handleToggleStatus = async (id: string) => {
        const result = await toggleSubscriberStatus(id);
        if (result.success) {
            toast.success('Subscriber status updated');
            loadSubscribers();
        } else {
            toast.error(result.error || 'Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this subscriber?')) return;

        const result = await deleteSubscriber(id);
        if (result.success) {
            toast.success('Subscriber deleted');
            loadSubscribers();
        } else {
            toast.error(result.error || 'Failed to delete');
        }
    };

    const handleExportCSV = () => {
        if (subscribers.length === 0) return;

        const headers = ['Email', 'Status', 'Joined Date'];
        const rows = subscribers.map(sub => [
            sub.email,
            sub.isActive ? 'Active' : 'Inactive',
            new Date(sub.createdAt).toLocaleDateString()
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold font-heading flex items-center gap-2">
                        Newsletter Management
                        {activeTab === 'list' && (
                            <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                {subscribers.length}
                            </span>
                        )}
                    </h1>
                    <p className="text-sm text-muted-foreground">Manage your email list and community growth.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-secondary/30 p-1 rounded-lg border border-border">
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'list' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Subscribers
                        </button>
                        <button
                            onClick={() => setActiveTab('compose')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'compose' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Compose
                        </button>
                    </div>
                    {activeTab === 'list' && (
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center justify-center gap-2 bg-background border border-border px-4 py-2 rounded-md hover:bg-secondary transition-all text-sm font-medium"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'list' ? (
                <>
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative md:col-span-2">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="email"
                                placeholder="Search subscribers by email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
                                <tr>
                                    <th className="px-6 py-4">Subscriber Email</th>
                                    <th className="px-6 py-4">Joined Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                        </td>
                                    </tr>
                                ) : subscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                            No subscribers found.
                                        </td>
                                    </tr>
                                ) : (
                                    subscribers.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-secondary/10 transition-colors">
                                            <td className="px-6 py-4 font-medium flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                {sub.email}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {new Date(sub.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${sub.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {sub.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleToggleStatus(sub.id)}
                                                        className={`p-1.5 rounded-md border transition-all ${sub.isActive
                                                            ? 'text-orange-600 border-orange-200 hover:bg-orange-50'
                                                            : 'text-green-600 border-green-200 hover:bg-green-50'
                                                            }`}
                                                        title={sub.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {sub.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(sub.id)}
                                                        className="p-1.5 text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-all"
                                                        title="Delete Subscriber"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="bg-card border border-border rounded-lg shadow-sm max-w-3xl mx-auto overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
                    <div className="p-6 border-b border-border bg-secondary/20">
                        <h2 className="text-lg font-medium flex items-center gap-2">
                            <Mail className="w-5 h-5 text-primary" />
                            Compose Newsletter
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            Sending to <span className="font-semibold text-foreground">{subscribers.filter(s => s.isActive).length} active subscribers</span>.
                        </p>
                    </div>
                    <form onSubmit={handleSendNewsletter} className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subject Line</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g. New Collection Arriving Soon! ✨"
                                required
                                className="w-full bg-background border border-border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Content (HTML)</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Professional email content... <p>Hey there!</p>"
                                required
                                rows={10}
                                className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <div className="text-xs text-muted-foreground">
                                Tip: Use HTML tags for better styling.
                            </div>
                            <button
                                type="submit"
                                disabled={isSending || !subject || !content}
                                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-md hover:bg-primary/90 transition-all text-sm font-medium disabled:opacity-50"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4" />
                                        Send to All Active
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
