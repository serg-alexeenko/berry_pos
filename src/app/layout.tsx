/**
 * @file: app/layout.tsx
 * @description: Кореневий layout з AuthProvider та глобальним обробником помилок
 * @dependencies: React, AuthProvider
 * @created: 2024-12-19
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Berry POS - Система управління бізнесом',
  description: 'Сучасна POS система для управління магазинами, кафе та ресторанами',
};

// Глобальний обробник помилок для Promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Необроблений Promise rejection:', event.reason);
    // Запобігаємо стандартному обробнику помилок
    event.preventDefault();
  });
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
