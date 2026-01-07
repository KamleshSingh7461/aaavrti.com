'use server';

import dbConnect from '@/lib/db';
import { SizeGuide } from '@/lib/models/SizeGuide';
import { revalidatePath } from 'next/cache';

// Get all size guides
export async function getSizeGuides() {
    try {
        await dbConnect();
        const guides = await SizeGuide.find().sort({ createdAt: -1 }).lean();
        return { success: true, guides: JSON.parse(JSON.stringify(guides)) };
    } catch (error) {
        console.error('Error fetching size guides:', error);
        return { success: false, error: 'Failed to fetch size guides' };
    }
}

// Get single size guide by ID
export async function getSizeGuideById(id: string) {
    try {
        await dbConnect();
        const guide = await SizeGuide.findById(id).lean();
        if (!guide) return { success: false, error: 'Size guide not found' };
        return { success: true, guide: JSON.parse(JSON.stringify(guide)) };
    } catch (error) {
        return { success: false, error: 'Failed to fetch size guide' };
    }
}

// Get size guide by Category ID (for Frontend)
export async function getSizeGuideByCategory(categoryId: string) {
    try {
        await dbConnect();
        // Find a guide specifically linked to this category
        // Or find a general one if not found (optional logic)
        const guide = await SizeGuide.findOne({ categoryId: categoryId, isActive: true }).lean();

        if (!guide) return null;
        return JSON.parse(JSON.stringify(guide));
    } catch (error) {
        console.error('Error fetching size guide by category:', error);
        return null;
    }
}

// Create new size guide
export async function createSizeGuide(data: any) {
    try {
        await dbConnect();
        const guide = await SizeGuide.create(data);
        revalidatePath('/admin/size-guides');
        return { success: true, guide: JSON.parse(JSON.stringify(guide)) };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to create size guide' };
    }
}

// Update size guide
export async function updateSizeGuide(id: string, data: any) {
    try {
        await dbConnect();
        const guide = await SizeGuide.findByIdAndUpdate(id, data, { new: true });
        revalidatePath('/admin/size-guides');
        return { success: true, guide: JSON.parse(JSON.stringify(guide)) };
    } catch (error: any) {
        return { success: false, error: error.message || 'Failed to update size guide' };
    }
}

// Delete size guide
export async function deleteSizeGuide(id: string) {
    try {
        await dbConnect();
        await SizeGuide.findByIdAndDelete(id);
        revalidatePath('/admin/size-guides');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'Failed to delete size guide' };
    }
}
