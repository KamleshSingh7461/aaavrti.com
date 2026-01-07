import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Ournika - Timeless Indian Fashion',
  description: 'Discover exquisite handcrafted Indian clothing, sarees, kurtas, and ethnic wear. Premium quality traditional Indian fashion.',
  keywords: ['Indian fashion', 'sarees', 'kurtas', 'ethnic wear', 'traditional clothing', 'handcrafted', 'Ournika'],
  authors: [{ name: 'Ournika Private Limited' }],
  creator: 'Ournika Private Limited',
  publisher: 'Ournika Private Limited',
  metadataBase: new URL('https://ournika.com'),
  alternates: {
    canonical: 'https://ournika.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://ournika.com',
    title: 'Ournika - Timeless Indian Fashion',
    description: 'Discover exquisite handcrafted Indian clothing, sarees, kurtas, and ethnic wear. Premium quality traditional Indian fashion.',
    siteName: 'Ournika',
    images: [
      {
        url: 'https://res.cloudinary.com/desdbjzzt/image/upload/v1767742482/OURNIKA_LOGO_jfawwb.png',
        width: 1200,
        height: 630,
        alt: 'Ournika Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ournika - Timeless Indian Fashion',
    description: 'Discover exquisite handcrafted Indian clothing, sarees, kurtas, and ethnic wear.',
    images: ['https://res.cloudinary.com/desdbjzzt/image/upload/v1767742482/OURNIKA_LOGO_jfawwb.png'],
    creator: '@ournika',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: 'https://res.cloudinary.com/desdbjzzt/image/upload/v1767742482/OURNIKA_LOGO_jfawwb.png',
    shortcut: 'https://res.cloudinary.com/desdbjzzt/image/upload/v1767742482/OURNIKA_LOGO_jfawwb.png',
    apple: 'https://res.cloudinary.com/desdbjzzt/image/upload/v1767742482/OURNIKA_LOGO_jfawwb.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: 'https://res.cloudinary.com/desdbjzzt/image/upload/v1767742482/OURNIKA_LOGO_jfawwb.png',
    },
  },
};

import { auth } from '@/auth';

import Script from 'next/script';
import { ConsentBanner } from '@/components/privacy/ConsentBanner';
import { OrganizationSchema, WebsiteSchema } from '@/components/seo/StructuredData';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <OrganizationSchema />
        <WebsiteSchema />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased`} suppressHydrationWarning>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7CNEJFGTMT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied'
            });
            gtag('js', new Date());
            gtag('config', 'G-7CNEJFGTMT');
          `}
        </Script>
        <Providers session={session}>
          {children}
          <ConsentBanner />
        </Providers>
      </body>
    </html>
  );
}
