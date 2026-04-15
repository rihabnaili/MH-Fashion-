import type { Metadata } from "next";
import { Cinzel, Montserrat, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import MainLayout from "./components/layouts/MainLayout";
import { LanguageProvider } from "./context/LanguageContext";
import { CartProvider } from "./context/CartContext"; 

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-sans-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MH Fashion",
  description: "MH Fashion — vêtements homme tendance en Tunisie avec livraison rapide et prix abordables.",
  metadataBase: new URL("https://www.mhfashion.tn"),

  openGraph: {
    title: "MH Fashion",
    description: "MH Fashion — vêtements homme tendance en Tunisie avec livraison rapide et prix abordables.",
    url: "https://www.mhfashion.tn",
    siteName: "MH Fashion",
    images: [
      {
        url: "/logo2.png",
        width: 1200,
        height: 630,
        alt: "MH Fashion Logo",
      },
    ],
    type: "website",
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo2.png", type: "image/png" }
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className={`${montserrat.variable} ${cinzel.variable} ${notoSansArabic.variable}`}
      >
        <LanguageProvider>
          <CartProvider>
            <MainLayout>{children}</MainLayout>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
