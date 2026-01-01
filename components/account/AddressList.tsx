'use client';

import { useState } from 'react';
import { deleteAddress } from '@/actions/checkout-actions';
import { AddressForm } from './AddressForm';
import { MapPin, Plus, Pencil, Trash2, Loader2, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';

interface Address {
    id: string;
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    country: string;
    userId: string;
    type: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface AddressListProps {
    initialAddresses: any[]; // Using any because of date serialization issues potential
    cormorantClassName?: string;
}

export function AddressList({ initialAddresses, cormorantClassName }: AddressListProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { toast } = useToast();

    // In a real app with revalidatePath, the page refreshes, but for instant UI feedback we might want local state too.
    // However, since we used revalidatePath in actions, the props *should* update if this was a server component.
    // But this is a client component receiving initial props.
    // Ideally we should use `useRouter().refresh()` in the form onSuccess callback to trigger a re-fetch.
    // For now, let's trust the server action revalidation + router refresh pattern.

    // Actually, let's just use router refresh for simplicity
    const { useRouter } = require('next/navigation');
    const router = useRouter();

    const handleSuccess = () => {
        setIsAdding(false);
        setEditingId(null);
        toast({
            title: "Success",
            description: "Address saved successfully.",
        });
        router.refresh();
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        const res = await deleteAddress(id);
        if (res.success) {
            toast({
                title: "Deleted",
                description: "Address has been removed.",
            });
            router.refresh();
        } else {
            toast({
                title: "Error",
                description: "Failed to delete address.",
                variant: "destructive"
            });
        }
        setDeletingId(null);
    };

    return (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add New Button / Form */}
            {isAdding ? (
                <FadeIn className="col-span-1 md:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className={cn("text-xl font-medium mb-4 flex items-center gap-2", cormorantClassName)}>
                        <MapPin className="h-5 w-5 text-primary" /> Add New Address
                    </h3>
                    <AddressForm
                        onSuccess={handleSuccess}
                        onCancel={() => setIsAdding(false)}
                    />
                </FadeIn>
            ) : (
                <StaggerItem>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full h-full min-h-[200px] border-2 border-dashed border-border hover:border-primary/50 hover:bg-secondary/20 rounded-xl flex flex-col items-center justify-center gap-3 transition-all group p-6"
                    >
                        <div className="h-12 w-12 rounded-full bg-secondary group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                            <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <span className="font-medium text-muted-foreground group-hover:text-primary transition-colors">Add New Address</span>
                    </button>
                </StaggerItem>
            )}

            {/* Address Cards */}
            {initialAddresses.map((addr) => (
                editingId === addr.id ? (
                    <FadeIn key={addr.id} className="col-span-1 md:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm ring-2 ring-primary/20">
                        <h3 className={cn("text-xl font-medium mb-4 flex items-center gap-2", cormorantClassName)}>
                            <Pencil className="h-4 w-4 text-primary" /> Edit Address
                        </h3>
                        <AddressForm
                            initialData={addr}
                            onSuccess={handleSuccess}
                            onCancel={() => setEditingId(null)}
                        />
                    </FadeIn>
                ) : (
                    <StaggerItem key={addr.id}>
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col relative group">
                            {/* Default Badge (Placeholder for logic) */}
                            {/* {addr.isDefault && (
                                <span className="absolute top-4 right-4 bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full">
                                    Default
                                </span>
                            )} */}

                            <div className="flex items-start gap-4 mb-4">
                                <div className="h-10 w-10 bg-secondary/30 rounded-full flex items-center justify-center shrink-0">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-lg">{addr.name}</h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <Phone className="h-3 w-3" /> {addr.phone}
                                    </p>
                                </div>
                            </div>

                            <div className="text-sm text-muted-foreground space-y-1 flex-1">
                                <p>{addr.street}</p>
                                <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                                <p>{addr.country}</p>
                            </div>

                            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border/50">
                                <button
                                    onClick={() => setEditingId(addr.id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors border border-transparent hover:border-border"
                                >
                                    <Pencil className="h-3.5 w-3.5" /> Edit
                                </button>
                                <div className="w-px h-4 bg-border" />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button
                                            className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                            disabled={deletingId === addr.id}
                                        >
                                            {deletingId === addr.id ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                                </>
                                            )}
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Address?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This address will be permanently removed from your account.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(addr.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </StaggerItem>
                )
            ))}
        </StaggerContainer>
    );
}
