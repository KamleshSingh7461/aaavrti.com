'use client';

import { useState } from 'react';
import { saveAddress, updateAddress } from '@/actions/checkout-actions';
import { Loader2 } from 'lucide-react';

interface Address {
    id: string;
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
}

interface AddressFormProps {
    initialData?: Address | null;
    onSuccess: (address: Address) => void;
    onCancel: () => void;
}

export function AddressForm({ initialData, onSuccess, onCancel }: AddressFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);

        let res;
        if (initialData) {
            formData.append('id', initialData.id);
            res = await updateAddress(formData);
        } else {
            res = await saveAddress(formData);
        }

        if (res.error) {
            setError(res.error);
        } else if (res.address) {
            onSuccess(res.address as Address);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                    <input
                        type="text"
                        name="name"
                        defaultValue={initialData?.name}
                        placeholder="Full Name"
                        required
                        className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded-md"
                    />
                </div>
                <div className="col-span-1 sm:col-span-2">
                    <input
                        type="tel"
                        name="phone"
                        defaultValue={initialData?.phone}
                        placeholder="Phone Number"
                        required
                        className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded-md"
                    />
                </div>
                <div className="col-span-1 sm:col-span-2">
                    <input
                        type="text"
                        name="street"
                        defaultValue={initialData?.street}
                        placeholder="Street Address"
                        required
                        className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded-md"
                    />
                </div>
                <div>
                    <input
                        type="text"
                        name="city"
                        defaultValue={initialData?.city}
                        placeholder="City"
                        required
                        className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded-md"
                    />
                </div>
                <div>
                    <input
                        type="text"
                        name="state"
                        defaultValue={initialData?.state}
                        placeholder="State"
                        required
                        className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded-md"
                    />
                </div>
                <div className="col-span-1 sm:col-span-2">
                    <input
                        type="text"
                        name="postalCode"
                        defaultValue={initialData?.postalCode}
                        placeholder="Postal Code"
                        required
                        className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded-md"
                    />
                </div>
            </div>

            {error && (
                <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md border border-destructive/20">
                    {error}
                </div>
            )}

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1 border border-border text-foreground py-3 hover:bg-secondary transition-all uppercase tracking-wider text-xs font-medium rounded-md"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary text-primary-foreground py-3 hover:bg-primary/90 transition-all disabled:opacity-50 uppercase tracking-wider text-xs font-medium rounded-md flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                    {initialData ? 'Update Address' : 'Save Address'}
                </button>
            </div>
        </form>
    );
}
