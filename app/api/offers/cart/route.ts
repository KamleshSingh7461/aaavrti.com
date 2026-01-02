import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/lib/models/Product';
import { Offer } from '@/lib/models/Marketing';

export async function POST(request: NextRequest) {
    try {
        const { productIds } = await request.json();

        if (!productIds || !Array.isArray(productIds)) {
            return NextResponse.json({ offers: [] });
        }

        await dbConnect();

        // Get categories for these products
        const products = await Product.find({ _id: { $in: productIds } })
            .select('categoryId')
            .lean();

        const categoryIds = [...new Set(products.map((p: any) => p.categoryId?.toString()))].filter(Boolean);

        // Fetch active offers
        const now = new Date();
        const offers = await Offer.find({
            isActive: true,
            $or: [
                { startDate: null },
                { startDate: { $lte: now } }
            ],
            $and: [
                {
                    $or: [
                        { endDate: null },
                        { endDate: { $gte: now } }
                    ]
                }
            ]
        }).sort({ value: -1 });

        // Filter offers applicable to cart items
        const applicableOffers = offers.filter((offer: any) => {
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

        const serializedOffers = applicableOffers.map((offer: any) => ({
            id: offer._id.toString(),
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
