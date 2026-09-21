import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import MainLayout from "./components/layouts/MainLayout";
import { LanguageProvider } from "./context/LanguageContext";
import { CartProvider } from "./context/CartContext"; 
import { SITE_URL } from "@/lib/productRoutes";

const META_PIXEL_ID = "4424903821170372";

// Fonts are self-hosted (variable WOFF2 files from Fontsource) so dev and builds
// don't depend on reaching Google Fonts.
const montserrat = localFont({
  src: "./fonts/montserrat-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-montserrat",
  display: "swap",
});

const cinzel = localFont({
  src: "./fonts/cinzel-latin-wght-normal.woff2",
  weight: "400 900",
  variable: "--font-cinzel",
  display: "swap",
});

const notoSansArabic = localFont({
  src: "./fonts/noto-sans-arabic-arabic-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-noto-sans-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MH Fashion",
  description: "MH Fashion — vêtements homme tendance en Tunisie avec livraison rapide et prix abordables.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "MH Fashion",
    description: "MH Fashion — vêtements homme tendance en Tunisie avec livraison rapide et prix abordables.",
    url: SITE_URL,
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

  twitter: {
    card: "summary_large_image",
    title: "MH Fashion",
    description: "MH Fashion — vêtements homme tendance en Tunisie avec livraison rapide et prix abordables.",
    images: ["/logo2.png"],
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
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <LanguageProvider>
          <CartProvider>
            <MainLayout>{children}</MainLayout>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
