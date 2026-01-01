import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'Aaavrti - Timeless Indian Fashion',
  description: 'Discover exquisite handcrafted Indian clothing',
  icons: {
    icon: 'https://res.cloudinary.com/desdbjzzt/image/upload/v1767270151/gemini-2.5-flash-image_Generate_me_the_logo_with_high_quality_file_by_removing_the_transpaprent_backgro-0_ezbqis.png',
  },
};

import { auth } from '@/auth';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
