import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Ournika - Timeless Indian Fashion',
        short_name: 'Ournika',
        description: 'Discover exquisite handcrafted Indian clothing, sarees, kurtas, and ethnic wear.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: 'https://res.cloudinary.com/desdbjzzt/image/upload/v1767742482/OURNIKA_LOGO_jfawwb.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: 'https://res.cloudinary.com/desdbjzzt/image/upload/v1767742482/OURNIKA_LOGO_jfawwb.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
