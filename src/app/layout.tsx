import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Script from "next/script";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: 'Capelo Club - Comunidade de Leitores',
    template: '%s | Capelo Club'
  },
  description: 'A maior comunidade de leitores do Brasil. Discuta livros, compartilhe resenhas e conecte-se com outros leitores.',
  keywords: ['livros', 'leitura', 'comunidade', 'resenhas', 'discussão', 'literatura'],
  icons: {
    icon: [
      { url: '/images/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/images/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/images/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://cclub.com.br',
    title: 'Capelo Club - Comunidade de Leitores',
    description: 'A maior comunidade de leitores do Brasil',
    siteName: 'Capelo Club',
    images: [{ url: '/images/logo.png', width: 1200, height: 630 }]
  }
};

import { ThemeProvider } from "@/components/theme-provider"
import ContactModerationButton from "@/components/ContactModerationButton"
import Footer from "@/components/Footer"
import ToastProvider from "@/components/ToastProvider"
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary"
import QueryProvider from "@/components/QueryProvider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Plausible Analytics */}
        <Script
          defer
          data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || "capelosclub.up.railway.app"}
          src={`${process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST || "https://plausible.io"}/js/script.js`}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-950`}
      >
        <GlobalErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <ToastProvider />
              <ContactModerationButton />
              <div className="flex flex-col min-h-screen">
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </div>
            </QueryProvider>
          </ThemeProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
