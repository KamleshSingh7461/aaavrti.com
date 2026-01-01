
'use client';

import { Activity, CheckCircle, Database, Server, AlertTriangle, Cpu, HardDrive } from 'lucide-react';

export default function AdminSystemPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold font-heading">System Health</h1>
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                    <Activity className="h-4 w-4" />
                    All Systems Operational
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatusCard
                    title="Server Load"
                    value="12%"
                    sub="2.4GHz / 8 Cores"
                    icon={Cpu}
                    status="good"
                />
                <StatusCard
                    title="Memory Usage"
                    value="4.2 GB"
                    sub="of 16 GB Total"
                    icon={Server}
                    status="good"
                />
                <StatusCard
                    title="Database"
                    value="Connected"
                    sub="PostgreSQL v16"
                    icon={Database}
                    status="good"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg shadow-sm p-6">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        Storage Usage
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Product Images</span>
                                <span className="text-muted-foreground">1.2 GB / 5 GB</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[24%]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Database Logs</span>
                                <span className="text-muted-foreground">150 MB / 1 GB</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-[15%]" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-lg shadow-sm">
                    <div className="p-4 border-b border-border font-medium">Recent Logs</div>
                    <div className="divide-y divide-border">
                        <LogItem type="success" msg="Database backup completed successfully" time="2 mins ago" />
                        <LogItem type="warning" msg="Memory usage peaked at 65%" time="1 hour ago" />
                        <LogItem type="info" msg="User authentication service restarted" time="3 hours ago" />
                        <LogItem type="success" msg="Daily cron job executed" time="5 hours ago" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusCard({ title, value, sub, icon: Icon, status }: any) {
    return (
        <div className="bg-card border border-border p-6 rounded-lg flex items-start justify-between">
            <div>
                <div className="text-muted-foreground text-xs font-medium uppercase mb-1">{title}</div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground mt-1">{sub}</div>
            </div>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${status === 'good' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                <Icon className="h-5 w-5" />
            </div>
        </div>
    )
}

function LogItem({ type, msg, time }: any) {
    return (
        <div className="p-4 flex items-start gap-3 hover:bg-secondary/20 transition-colors">
            <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${type === 'success' ? 'bg-green-500' :
                    type === 'warning' ? 'bg-orange-500' :
                        'bg-blue-500'
                }`} />
            <div className="flex-1">
                <div className="text-sm">{msg}</div>
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">{time}</div>
        </div>
    )
}
