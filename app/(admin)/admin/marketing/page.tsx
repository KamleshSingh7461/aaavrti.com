
'use client';

import { Mail, Megaphone, Plus, Send, Users, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function AdminMarketingPage() {
    const [activeTab, setActiveTab] = useState('campaigns');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold font-heading">Marketing</h1>
                    <p className="text-sm text-muted-foreground">Engage your customers with newsletters and campaigns.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('campaigns')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'campaigns' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                    >
                        Campaigns
                    </button>
                    <button
                        onClick={() => setActiveTab('subscribers')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'subscribers' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                    >
                        Subscribers
                    </button>
                </div>
            </div>

            {activeTab === 'campaigns' ? <CampaignsView /> : <SubscribersView />}
        </div>
    );
}

function CampaignsView() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Sent" value="12,450" icon={Send} />
                <StatCard title="Avg. Open Rate" value="24.8%" icon={Mail} />
                <StatCard title="Avg. Click Rate" value="3.2%" icon={TrendingUp} />
            </div>

            <div className="bg-card border border-border rounded-lg shadow-sm">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-medium">Recent Campaigns</h3>
                    <button className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors text-xs font-medium">
                        <Plus className="h-3 w-3" />
                        Create Campaign
                    </button>
                </div>
                <div className="divide-y divide-border">
                    <CampaignItem
                        name="Diwali Sale Announcement"
                        status="Sent"
                        date="Oct 24, 2024"
                        stats={{ open: '45%', click: '12%' }}
                    />
                    <CampaignItem
                        name="Winter Collection Preview"
                        status="Draft"
                        date="Edited 2 hours ago"
                        stats={null}
                    />
                    <CampaignItem
                        name="Abandoned Cart Recovery #4"
                        status="Active (Automated)"
                        date="Ongoing"
                        stats={{ open: '62%', click: '18%' }}
                    />
                </div>
            </div>
        </div>
    )
}

function SubscribersView() {
    return (
        <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                    <h3 className="font-medium">Subscriber List</h3>
                    <p className="text-xs text-muted-foreground">2,405 active subscribers</p>
                </div>
                <button className="text-xs border border-border bg-background px-3 py-1.5 rounded-md hover:bg-secondary transition-colors">
                    Export CSV
                </button>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
                    <tr>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Subscribed Date</th>
                        <th className="px-6 py-4">Source</th>
                        <th className="px-6 py-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="hover:bg-secondary/20 transition-colors">
                            <td className="px-6 py-4 font-medium">user{i}@example.com</td>
                            <td className="px-6 py-4 text-muted-foreground">Dec {20 - i}, 2024</td>
                            <td className="px-6 py-4 text-xs">Footer Signup</td>
                            <td className="px-6 py-4">
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-medium border border-green-200">
                                    Subscribed
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function StatCard({ title, value, icon: Icon }: any) {
    return (
        <div className="bg-card border border-border p-4 rounded-lg flex items-center gap-4">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <div className="text-muted-foreground text-xs font-medium uppercase">{title}</div>
                <div className="text-xl font-bold">{value}</div>
            </div>
        </div>
    )
}

function CampaignItem({ name, status, date, stats }: any) {
    return (
        <div className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors group cursor-pointer">
            <div>
                <div className="font-medium flex items-center gap-2">
                    {name}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${status === 'Sent' ? 'bg-green-50 text-green-700 border-green-200' :
                            status === 'Draft' ? 'bg-secondary text-muted-foreground border-border' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>{status}</span>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" /> {date}
                </div>
            </div>
            {stats && (
                <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                        <div className="font-bold">{stats.open}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Open</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold">{stats.click}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Click</div>
                    </div>
                </div>
            )}
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${!stats ? 'ml-auto' : ''}`}>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
        </div>
    )
}
