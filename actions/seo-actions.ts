'use server';

import dbConnect from "@/lib/db";
import { PageMetadata, SEOTracking } from "@/lib/models/Marketing";
import { revalidatePath } from "next/cache";

export type PageMetaDTO = {
    id: string;
    path: string;
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
    isSystem: boolean;
};

/**
 * Get all configured page metadata
 */
export async function getAllPageMetadata(): Promise<PageMetaDTO[]> {
    try {
        await dbConnect();
        const docs = await PageMetadata.find().sort({ path: 1 }).lean();
        return docs.map((doc: any) => ({
            id: doc._id.toString(),
            path: doc.path,
            title: doc.title,
            description: doc.description,
            keywords: doc.keywords,
            ogImage: doc.ogImage,
            isSystem: doc.isSystem
        }));
    } catch (error) {
        console.error("Error fetching all page metadata:", error);
        return [];
    }
}

/**
 * Get metadata for a specific path (Public use)
 */
export async function getMetadataForPath(path: string): Promise<PageMetaDTO | null> {
    try {
        await dbConnect();
        const doc = await PageMetadata.findOne({ path }).lean();
        if (!doc) return null;
        return {
            id: doc._id.toString(),
            path: doc.path,
            title: doc.title,
            description: doc.description,
            keywords: doc.keywords,
            ogImage: doc.ogImage,
            isSystem: doc.isSystem
        };
    } catch (error) {
        // Silent fail for public
        return null;
    }
}

/**
 * Create or Update Page Metadata
 */
export async function upsertPageMetadata(data: {
    path: string;
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
    isSystem?: boolean;
}) {
    try {
        await dbConnect();
        const { path, ...updateData } = data;

        const result = await PageMetadata.findOneAndUpdate(
            { path },
            { $set: updateData },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        revalidatePath(path); // Revalidate the actual public page
        revalidatePath('/admin/marketing/seo'); // Revalidate admin dashboard

        return { success: true, id: result._id.toString() };
    } catch (error: any) {
        console.error("Error updating page metadata:", error);
        return { error: error.message };
    }
}

/**
 * Delete Page Metadata
 */
export async function deletePageMetadata(id: string) {
    try {
        await dbConnect();
        const doc = await PageMetadata.findById(id);

        if (!doc) return { error: "Not found" };
        if (doc.isSystem) return { error: "Cannot delete system pages" };

        await PageMetadata.findByIdAndDelete(id);
        revalidatePath('/admin/marketing/seo');

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting page metadata:", error);
        return { error: error.message };
    }
}

/**
 * Get Rankings (Re-export or specialized)
 */
export async function getSEORankings(limit = 50) {
    try {
        await dbConnect();
        const docs = await SEOTracking.find().sort({ date: -1 }).limit(limit).lean();
        return docs.map((doc: any) => ({
            id: doc._id.toString(),
            keyword: doc.keyword,
            url: doc.url,
            position: doc.position,
            date: doc.date,
            change: 0 // Placeholder for now, could calc diff from previous
        }));
    } catch (error) {
        console.error("Error getting rankings:", error);
        return [];
    }
}

/**
 * Add Ranking Record
 */
export async function trackSEORanking(keyword: string, position: number, url: string) {
    try {
        await dbConnect();
        await SEOTracking.create({ keyword, position, url });
        revalidatePath('/admin/marketing/seo');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
