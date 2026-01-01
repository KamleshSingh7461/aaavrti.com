import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { productIds } = await request.json();

        if (!productIds || !Array.isArray(productIds)) {
            return NextResponse.json({ offers: [] });
        }

        // Get categories for these products
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { categoryId: true }
        });

        const categoryIds = [...new Set(products.map(p => p.categoryId))];

        // Fetch active offers
        const now = new Date();
        const offers = await prisma.offer.findMany({
            where: {
                isActive: true,
                OR: [
                    { startDate: null },
                    { startDate: { lte: now } }
                ],
                AND: [
                    {
                        OR: [
                            { endDate: null },
                            { endDate: { gte: now } }
                        ]
                    }
                ]
            },
            orderBy: { value: 'desc' }
        });

        // Filter offers applicable to cart items
        const applicableOffers = offers.filter(offer => {
            // Check usage limit
            if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
                return false;
            }

            // Check applicability
            if (offer.applicableType === 'ALL') {
                return true;
            }

            const targetIds = JSON.parse(offer.applicableIds || '[]');

            if (offer.applicableType === 'PRODUCT') {
                return productIds.some(id => targetIds.includes(id));
            }

            if (offer.applicableType === 'CATEGORY') {
                return categoryIds.some(id => targetIds.includes(id));
            }

            return false;
        });

        // Convert Decimal to number for serialization
        const serializedOffers = applicableOffers.map(offer => ({
            id: offer.id,
            code: offer.code,
            type: offer.type,
            value: Number(offer.value),
            minAmount: Number(offer.minAmount),
            maxDiscount: offer.maxDiscount ? Number(offer.maxDiscount) : null,
            endDate: offer.endDate ? offer.endDate.toISOString() : null
        }));

        return NextResponse.json({ offers: serializedOffers });
    } catch (error) {
        console.error('Error fetching cart offers:', error);
        return NextResponse.json({ offers: [] });
    }
}
