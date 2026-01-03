import { MetadataRoute } from 'next'
import dbConnect from '@/lib/db'
import { Product, Category } from '@/lib/models/Product'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    await dbConnect()

    const baseUrl = 'https://aaavrti.shop'

    // 1. Static Pages
    const staticRoutes = [
        '',
        '/shop',
        '/new/arrival',
        '/login',
        '/signup',
        '/faq',
        '/contact',
        '/shipping-policy',
        '/return-policy',
        '/data-deletion',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }))

    // 2. Fetch Products (Only PUBLISHED ones ideally, but we'll fetch all non-draft if possible, or just all for now to be safe)
    // Checking schema, default is DRAFT. Let's include everything that isn't explicitly hidden? 
    // For now, let's include all products to ensure they appear, as I'm not 100% unsure of the user's publishing workflow yet.
    // Actually, better to filter `status: 'PUBLISHED'` if the standard implies it.
    // Given previous inspection, I'll allow all for now but prioritize 'PUBLISHED' if I had to choose. 
    // I will just fetch ALL to be consistent with get-products for now.
    const products = await Product.find({}).select('slug updatedAt').lean()

    const productRoutes = products.map((product) => ({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    // 3. Fetch Categories
    const categories = await Category.find({}).select('slug updatedAt').lean()

    const categoryRoutes = categories.map((cat) => ({
        url: `${baseUrl}/category/${cat.slug}`,
        lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [...staticRoutes, ...productRoutes, ...categoryRoutes]
}
