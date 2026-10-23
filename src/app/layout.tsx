import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'AI Protector — Private by Design. Trust by Intelligence.',
  description: 'Enterprise-grade, privacy-first digital security platform. Verify links, messages, numbers, files, and claims without data persistence.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#0E1013',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark h-full antialiased ${inter.variable}`} suppressHydrationWarning>
      <body
        className="min-h-full flex flex-col bg-[#0E1013] text-[#FBF9F5] font-sans selection:bg-[#D4AF37]/25 selection:text-[#FBF9F5]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
