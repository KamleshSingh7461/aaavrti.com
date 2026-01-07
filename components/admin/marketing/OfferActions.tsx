'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toggleOfferStatus, deleteOffer } from '@/actions/offer-actions';
import { Pause, Play, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OfferActionsProps {
    offerId: string;
    isActive: boolean;
    offerCode: string;
}

export function OfferActions({ offerId, isActive, offerCode }: OfferActionsProps) {
    const router = useRouter();
    const [isToggling, setIsToggling] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleToggle = async () => {
        setIsToggling(true);
        try {
            const result = await toggleOfferStatus(offerId);
            if (result.success) {
                toast.success(result.isActive ? 'Offer activated' : 'Offer paused');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to toggle offer');
            }
        } catch (error) {
            toast.error('Failed to toggle offer');
        } finally {
            setIsToggling(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteOffer(offerId);
            if (result.success) {
                toast.success('Offer deleted');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to delete offer');
            }
        } catch (error) {
            toast.error('Failed to delete offer');
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleToggle}
                    disabled={isToggling}
                    title={isActive ? 'Pause offer' : 'Activate offer'}
                >
                    {isActive ? (
                        <Pause className="h-4 w-4" />
                    ) : (
                        <Play className="h-4 w-4" />
                    )}
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => router.push(`/admin/marketing/offers/${offerId}`)}
                    title="Edit offer"
                >
                    <Edit className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowDeleteDialog(true)}
                    title="Delete offer"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Offer</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the offer <strong>{offerCode}</strong>?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
