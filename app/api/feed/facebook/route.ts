import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/lib/models/Product';
import { Category } from '@/lib/models/Product'; // Assuming Category is exported from same file or imported separately

export async function GET() {
    try {
        await dbConnect();

        // Fetch published products
        const products = await Product.find({
            status: 'PUBLISHED'
        })
            .populate('categoryId')
            .sort({ updatedAt: -1 })
            .lean();

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aaavrti.shop';

        // Start XML construction
        let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Aaavrti Product Feed</title>
<link>${baseUrl}</link>
<description>Premium Ethnic Wear Collection</description>
`;

        for (const product of products) {
            // Robust image parsing similar to other components
            let mainImage = '';
            try {
                if (Array.isArray(product.images) && product.images.length > 0) {
                    mainImage = product.images[0];
                } else if (typeof product.images === 'string') {
                    const parsed = JSON.parse(product.images);
                    if (Array.isArray(parsed) && parsed.length > 0) mainImage = parsed[0];
                    else mainImage = product.images;
                }
            } catch (e) {
                mainImage = ''; // Fallback handled below
            }

            // Skip if no image (Meta requires images)
            if (!mainImage || mainImage === '[]') continue;

            // Ensure absolute URL for image
            if (mainImage.startsWith('/')) mainImage = `${baseUrl}${mainImage}`;

            // Category string
            const categoryName = (product.categoryId as any)?.name_en || 'Apparel';

            // Construct Item
            xml += `
<item>
<g:id>${product._id}</g:id>
<g:title><![CDATA[${product.name_en}]]></g:title>
<g:description><![CDATA[${product.description_en || product.name_en}]]></g:description>
<g:link>${baseUrl}/product/${product.slug || product._id}</g:link>
<g:image_link>${mainImage}</g:image_link>
<g:brand>Aaavrti</g:brand>
<g:condition>new</g:condition>
<g:availability>${product.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>
<g:price>${product.price} INR</g:price>
<g:google_product_category>Apparel &gt; Clothing</g:google_product_category>
<g:custom_label_0>${categoryName}</g:custom_label_0>
</item>`;
        }

        xml += `
</channel>
</rss>`;

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'text/xml',
                'Cache-Control': 's-maxage=3600, stale-while-revalidate',
            },
        });
    } catch (error) {
        console.error('Feed generation error:', error);
        return new NextResponse('Error generating feed', { status: 500 });
    }
}
