/**
 * Structured Data (JSON-LD) for SEO
 * Helps Google understand your business and display rich results
 */

export function OrganizationSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Ournika Private Limited',
        alternateName: 'Ournika',
        url: 'https://ournika.com',
        logo: 'https://res.cloudinary.com/desdbjzzt/image/upload/v1767742482/OURNIKA_LOGO_jfawwb.png',
        description: 'Premium Indian ethnic wear and traditional clothing brand offering handcrafted sarees, kurtas, and ethnic fashion.',
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+91-7461913495',
            contactType: 'Customer Service',
            areaServed: 'IN',
            availableLanguage: ['English', 'Hindi']
        },
        sameAs: [
            // Add your social media URLs here when ready
            // 'https://www.facebook.com/ournika',
            // 'https://www.instagram.com/ournika',
            // 'https://twitter.com/ournika'
        ],
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'IN',
            // Add full address when company registration is complete
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function WebsiteSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Ournika',
        url: 'https://ournika.com',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://ournika.com/products?search={search_term_string}'
            },
            'query-input': 'required name=search_term_string'
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

export function ProductSchema({ product }: { product: any }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name_en,
        description: product.description_en,
        image: product.images?.[0] || '',
        brand: {
            '@type': 'Brand',
            name: 'Ournika'
        },
        offers: {
            '@type': 'Offer',
            url: `https://ournika.com/product/${product.slug}`,
            priceCurrency: 'INR',
            price: product.price,
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'Ournika Private Limited'
            }
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
