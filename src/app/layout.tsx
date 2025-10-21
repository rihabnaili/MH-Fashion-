import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "./components/layouts/MainLayout";
import { LanguageProvider } from "./context/LanguageContext";
import { CartProvider } from "./context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MH Fashion",
  description: "Votre boutique de mode en ligne",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <LanguageProvider>
          <CartProvider>
            <MainLayout>{children}</MainLayout>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
