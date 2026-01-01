export function ShippingForm() {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium">First Name</label>
                    <input type="text" className="w-full h-10 px-3 bg-background border border-border rounded-md focus:border-primary focus:outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Last Name</label>
                    <input type="text" className="w-full h-10 px-3 bg-background border border-border rounded-md focus:border-primary focus:outline-none" />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">Card Address</label>
                <input type="text" className="w-full h-10 px-3 bg-background border border-border rounded-md focus:border-primary focus:outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium">City</label>
                    <input type="text" className="w-full h-10 px-3 bg-background border border-border rounded-md focus:border-primary focus:outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium">Pincode (Shiprocket)</label>
                    <input type="text" placeholder="Check Serviceability" className="w-full h-10 px-3 bg-background border border-border rounded-md focus:border-primary focus:outline-none" />
                </div>
            </div>
        </div>
    );
}
