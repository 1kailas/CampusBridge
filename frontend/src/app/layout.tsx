import type { Metadata, Viewport } from 'next';
import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Campus Bridge — Placement readiness, engineered',
    template: '%s · Campus Bridge',
  },
  description:
    'Practise the coding rounds campus drives actually run: a curated problem set, SDE sheets, timed mock tests and a multi-language judge for TCS NQT, Infosys, Amazon, Microsoft and Google.',
  applicationName: 'Campus Bridge',
  keywords: [
    'campus placement',
    'coding practice',
    'TCS NQT',
    'Infosys DPhi',
    'Amazon OA',
    'DSA sheets',
    'mock tests',
  ],
  authors: [{ name: 'Campus Bridge' }],
  icons: {
    icon: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#080E1B',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-mark focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex w-full flex-1 flex-col">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
