import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { AppProviders } from '@/components/providers/app-providers';
import { SITE_NAME } from '@/lib/constants';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — House & Flat for Rent in Bangladesh`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Find a house for rent or flat for rent in Dhaka, Chattogram and across Bangladesh. Free for renters and owners.',
  keywords: ['house for rent', 'flat for rent', 'to-let', 'Dhaka rent', 'Bangladesh rental', 'Rent House BD'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
