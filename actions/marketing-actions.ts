
'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getBanners() {
    try {
        const banners = await prisma.banner.findMany({
            orderBy: { sortOrder: 'asc' }
        });
        return banners;
    } catch (error) {
        console.error('Failed to fetch banners:', error);
        return [];
    }
}

export async function getActiveBanners() {
    try {
        const banners = await prisma.banner.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });
        return banners;
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
        await prisma.banner.create({
            data: {
                title,
                subtitle,
                image,
                mobileImage,
                link,
                ctaText,
                sortOrder,
                isActive: true
            }
        });
        revalidatePath('/'); // Homepage
        revalidatePath('/marketing/banners');
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
        await prisma.banner.delete({ where: { id } });
        revalidatePath('/');
        revalidatePath('/marketing/banners');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete banner' };
    }
}

export async function toggleBannerStatus(id: string, isActive: boolean) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: 'Unauthorized' };

    await prisma.banner.update({
        where: { id },
        data: { isActive }
    });
    revalidatePath('/');
    revalidatePath('/marketing/banners');
    return { success: true };
}

export async function getFlashSale() {
    try {
        const offer = await prisma.offer.findFirst({
            where: {
                isActive: true,
                endDate: { gt: new Date() }
            },
            orderBy: { endDate: 'asc' } // Closest expiring offer
        });

        if (!offer) return null;

        return {
            ...offer,
            value: Number(offer.value),
            minAmount: offer.minAmount ? Number(offer.minAmount) : null,
            maxDiscount: offer.maxDiscount ? Number(offer.maxDiscount) : null,
        };
    } catch (error) {
        console.error('Failed to fetch flash sale:', error);
        return null;
    }
}

export async function getBanner(id: string) {
    try {
        const banner = await prisma.banner.findUnique({
            where: { id }
        });
        return banner;
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
        await prisma.banner.update({
            where: { id },
            data: {
                title,
                subtitle,
                image,
                mobileImage,
                link,
                ctaText,
                sortOrder
            }
        });
        revalidatePath('/');
        revalidatePath('/admin/marketing/banners');
        return { success: true };
    } catch (error) {
        console.error('Failed to update banner:', error);
        return { error: 'Failed to update banner' };
    }
}
