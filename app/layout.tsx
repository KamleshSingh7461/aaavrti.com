import type { Metadata } from 'next';
import { Geist, Geist_Mono, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Aaavrti - Timeless Indian Fashion',
  description: 'Discover exquisite handcrafted Indian clothing',
};

import { auth } from '@/auth';

import Script from 'next/script';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} antialiased`} suppressHydrationWarning>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7CNEJFGTMT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-7CNEJFGTMT');
          `}
        </Script>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
