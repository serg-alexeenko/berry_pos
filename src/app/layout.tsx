/**
 * @file: app/layout.tsx
 * @description: Кореневий layout з AuthProvider та глобальним обробником помилок
 * @dependencies: React, AuthProvider
 * @created: 2024-12-19
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Berry POS - Сучасна система управління рестораном",
  description: "Інтелектуальна POS система для управління закладами харчування. Від замовлень до аналітики - все в одному місці.",
  keywords: "POS система, ресторан, кафе, управління закладом, аналітика, CRM",
  authors: [{ name: "Berry POS Team" }],
  creator: "Berry POS",
  publisher: "Berry POS",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "uk_UA",
    url: "https://berrypos.com",
    title: "Berry POS - Сучасна система управління рестораном",
    description: "Інтелектуальна POS система для управління закладами харчування",
    siteName: "Berry POS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Berry POS - Сучасна система управління рестораном",
    description: "Інтелектуальна POS система для управління закладами харчування",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
