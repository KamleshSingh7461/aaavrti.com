'use client';

import { useState } from 'react';
import { CreditCard, Truck, Store, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState('general');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold font-heading">Settings</h1>
                <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm">
                    <Save className="h-4 w-4" />
                    Save Changes
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Nav */}
                <div className="w-full md:w-64 flex flex-col gap-1">
                    <TabButton
                        active={activeTab === 'general'}
                        onClick={() => setActiveTab('general')}
                        icon={Store}
                        label="General / Business"
                    />
                    <TabButton
                        active={activeTab === 'payments'}
                        onClick={() => setActiveTab('payments')}
                        icon={CreditCard}
                        label="Payments (Razorpay)"
                    />
                    <TabButton
                        active={activeTab === 'shipping'}
                        onClick={() => setActiveTab('shipping')}
                        icon={Truck}
                        label="Shipping (Shiprocket)"
                    />
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-6">
                    {activeTab === 'general' && <GeneralSettings />}
                    {activeTab === 'payments' && <PaymentSettings />}
                    {activeTab === 'shipping' && <ShippingSettings />}
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors text-left",
                active
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
        >
            <Icon className="h-4 w-4" />
            {label}
        </button>
    );
}

function GeneralSettings() {
    return (
        <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-6">
            <div>
                <h3 className="font-medium text-lg">Business Details</h3>
                <p className="text-muted-foreground text-sm">For Invoicing and Legal Compliance (Proprietorship).</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Display Name" defaultValue="Aaavrti" />
                <InputGroup label="Registered Business Name" defaultValue="Aaavrti Enterprises" />
                <InputGroup label="Proprietor Name" defaultValue="Kamlesh Kumar Singh" />
                <InputGroup label="Support Email" defaultValue="kamlesh7461@gmail.com" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <InputGroup label="GSTIN (Optional)" placeholder="22AAAAA0000A1Z5" />
                <InputGroup label="PAN Number" placeholder="ABCDE1234F" />
            </div>
            <div className="pt-4 border-t border-border">
                <label className="text-sm font-medium mb-1.5 block">Registered Address</label>
                <textarea
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm min-h-[80px]"
                    defaultValue="d/206 Jankalyan CHS, KURLA WEST, Mumbai, MAHARASHTRA 400070"
                />
            </div>
        </div>
    )
}

function PaymentSettings() {
    return (
        <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-6 border-l-4 border-l-[#3395ff]">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-lg">Razorpay Configuration</h3>
                        <p className="text-muted-foreground text-sm">Accept payments via UPI, Cards, and Netbanking.</p>
                    </div>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium border border-green-200">Active</span>
                </div>

                <div className="space-y-4">
                    <InputGroup label="Key ID" defaultValue="rzp_test_12345678" type="password" />
                    <InputGroup label="Key Secret" defaultValue="****************" type="password" />
                </div>

                <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-4">
                        Webhooks allow Razorpay to notify your store when a payment is successful.
                    </p>
                    <InputGroup label="Webhook Secret" placeholder="whsec_..." />
                </div>
            </div>
        </div>
    )
}

function ShippingSettings() {
    return (
        <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-6 border-l-4 border-l-[#702bf9]">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-lg">Shiprocket Integration</h3>
                        <p className="text-muted-foreground text-sm">Automated shipping and AWB generation.</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium border border-yellow-200">Test Mode</span>
                </div>

                <div className="space-y-4">
                    <InputGroup label="Shiprocket Email" defaultValue="kamlesh7461@gmail.com" />
                    <InputGroup label="API Token" type="password" defaultValue="********************************" />
                </div>
            </div>

            <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-4">
                <h3 className="font-medium text-lg">Pickup Locations</h3>
                <div className="border border-border rounded-md p-4 bg-secondary/10 flex items-start justify-between">
                    <div>
                        <div className="font-medium">Primary Warehouse (Mumbai)</div>
                        <div className="text-sm text-muted-foreground mt-1">
                            d/206 Jankalyan CHS, KURLA WEST<br />
                            Mumbai, Maharashtra - 400070
                        </div>
                        <div className="mt-2 text-xs bg-green-100 text-green-700 inline-block px-2 py-1 rounded">Verified</div>
                    </div>
                    <button className="text-sm text-primary hover:underline">Edit</button>
                </div>
                <button className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                    + Add New Pickup Location
                </button>
            </div>
        </div>
    )
}

function InputGroup({ label, type = "text", ...props }: any) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <input
                type={type}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...props}
            />
        </div>
    )
}
