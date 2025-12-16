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
  title: "Capelo's Club",
  description: "Sua comunidade exclusiva de leitura. Conecte-se com leitores apaixonados e discuta seus livros favoritos.",
};

import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
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
              <div className="fixed top-4 right-4 z-50">
                <ModeToggle />
              </div>
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
