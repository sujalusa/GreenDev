import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { AppProvider } from '@/lib/store';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'GreenDev Coach — Sustainability Analysis for Student Projects',
  description:
    'Analyze your GitHub repo and AWS deployment for sustainability. Get a score, ranked recommendations, and an AI-generated report to make your project greener.',
  keywords: ['sustainability', 'green software', 'AWS', 'GitHub', 'hackathon', 'student projects'],
  openGraph: {
    title: 'GreenDev Coach',
    description: 'AI-powered sustainability analysis for student software projects.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,700,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.variable} style={{ fontFamily: 'var(--font-body)' }}>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            <AppProvider>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-[var(--color-primary)] focus:text-white"
              >
                Skip to content
              </a>
              {children}
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
