'use server';

import { auth } from '@/auth';
import dbConnect from '@/lib/db';
import { Banner, Coupon, Offer } from '@/lib/models/Marketing';
import { revalidatePath } from 'next/cache';
import { serialize } from '@/lib/serialize';

export async function getBanners() {
    try {
        await dbConnect();
        const banners = await Banner.find().sort({ sortOrder: 1 }).lean();
        return serialize(banners);
    } catch (error) {
        console.error('Failed to fetch banners:', error);
        return [];
    }
}

export async function getActiveBanners() {
    try {
        await dbConnect();
        const banners = await Banner.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
        return serialize(banners);
    } catch (error) {
        console.error('Failed to fetch active banners:', error);
        return [];
    }
}

export async function createBanner(data: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: 'Unauthorized' };

    const title = data.get('title') as string;
    const subtitle = data.get('subtitle') as string;
    const image = data.get('image') as string;
    const mobileImage = data.get('mobileImage') as string;
    const link = data.get('link') as string;
    const ctaText = data.get('ctaText') as string;
    const sortOrder = Number(data.get('sortOrder') || 0);

    if (!title || !image) return { error: 'Title and Image are required' };

    try {
        await dbConnect();
        await Banner.create({
            title,
            subtitle,
            image,
            mobileImage,
            link,
            ctaText,
            sortOrder,
            isActive: true
        });
        revalidatePath('/'); // Homepage
        revalidatePath('/admin/marketing/banners');
        return { success: true };
    } catch (error) {
        console.error('Failed to create banner:', error);
        return { error: 'Failed to create banner' };
    }
}

export async function deleteBanner(id: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: 'Unauthorized' };

    try {
        await dbConnect();
        await Banner.findByIdAndDelete(id);
        revalidatePath('/');
        revalidatePath('/admin/marketing/banners');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete banner' };
    }
}

export async function toggleBannerStatus(id: string, isActive: boolean) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: 'Unauthorized' };

    try {
        await dbConnect();
        await Banner.findByIdAndUpdate(id, { isActive });
        revalidatePath('/');
        revalidatePath('/admin/marketing/banners');
        return { success: true };
    } catch (e) {
        return { error: 'Failed' };
    }
}

export async function getFlashSale() {
    try {
        await dbConnect();
        // Uses Coupon now as Offer was replaced or Flash Sale logic adapted
        const offer = await Coupon.findOne({
            active: true,
            validUntil: { $gt: new Date() }
        }).sort({ validUntil: 1 }).lean();

        if (!offer) return null;


        if (!offer) return null;

        return serialize({
            ...offer,
            value: Number(offer.value),
            minAmount: offer.minOrderValue ? Number(offer.minOrderValue) : null,
            maxDiscount: offer.maxDiscount ? Number(offer.maxDiscount) : null,
            endDate: offer.validUntil,
        });
    } catch (error) {
        console.error('Failed to fetch flash sale:', error);
        return null;
    }
}

export async function getBanner(id: string) {
    try {
        await dbConnect();
        const banner = await Banner.findById(id).lean();
        return banner ? serialize(banner) : null;
    } catch (error) {
        console.error('Failed to fetch banner:', error);
        return null;
    }
}

export async function updateBanner(id: string, data: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: 'Unauthorized' };

    const title = data.get('title') as string;
    const subtitle = data.get('subtitle') as string;
    const image = data.get('image') as string;
    const mobileImage = data.get('mobileImage') as string;
    const link = data.get('link') as string;
    const ctaText = data.get('ctaText') as string;
    const sortOrder = Number(data.get('sortOrder') || 0);

    if (!title || !image) return { error: 'Title and Image are required' };

    try {
        await dbConnect();
        await Banner.findByIdAndUpdate(id, {
            title,
            subtitle,
            image,
            mobileImage,
            link,
            ctaText,
            sortOrder
        });
        revalidatePath('/');
        revalidatePath('/admin/marketing/banners');
        return { success: true };
    } catch (error) {
        console.error('Failed to update banner:', error);
        return { error: 'Failed to update banner' };
    }
}

// --- Offer Actions ---

export async function getOffers() {
    try {
        await dbConnect();
        const offers = await Offer.find().sort({ createdAt: -1 }).lean();
        return serialize(offers);
    } catch (error) {
        console.error('Failed to fetch offers:', error);
        return [];
    }
}

export async function getOfferById(id: string) {
    try {
        await dbConnect();
        const offer = await Offer.findById(id).lean();
        return offer ? serialize(offer) : null;
    } catch (error) {
        console.error('Failed to fetch offer:', error);
        return null;
    }
}

export async function createOffer(data: any) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: 'Unauthorized' };

    try {
        await dbConnect();
        const newOffer = await Offer.create(data);
        revalidatePath('/admin/marketing/offers');
        return { success: true, id: newOffer._id.toString() };
    } catch (error: any) {
        console.error('Failed to create offer:', error);
        return { error: error.message || 'Failed to create offer' };
    }
}

export async function updateOffer(id: string, data: any) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: 'Unauthorized' };

    try {
        await dbConnect();
        await Offer.findByIdAndUpdate(id, data);
        revalidatePath('/admin/marketing/offers');
        revalidatePath(`/admin/marketing/offers/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update offer:', error);
        return { error: error.message || 'Failed to update offer' };
    }
}

export async function deleteOffer(id: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: 'Unauthorized' };

    try {
        await dbConnect();
        await Offer.findByIdAndDelete(id);
        revalidatePath('/admin/marketing/offers');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to delete offer:', error);
        return { error: error.message || 'Failed to delete offer' };
    }
}
