import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import {
  DEFAULT_OG_IMAGE_PATH,
  SITE_AUTHOR_NAME,
  SITE_BRAND_NAME,
  SITE_DESCRIPTION,
  SITE_OG_LOCALE,
  createMetadataImage,
  getDefaultRobotsMetadata,
  getSiteUrl,
} from "@/lib/seo";

const jetbrainsMono = localFont({
  variable: "--font-jetbrains",
  src: [
    { path: "../../public/fonts/jetbrains-mono-latin-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/jetbrains-mono-latin-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/jetbrains-mono-latin-700.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/jetbrains-mono-vietnamese-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/jetbrains-mono-vietnamese-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/jetbrains-mono-vietnamese-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: SITE_BRAND_NAME,
    template: `%s | ${SITE_BRAND_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_BRAND_NAME,
  authors: [{ name: SITE_AUTHOR_NAME, url: getSiteUrl() }],
  creator: SITE_AUTHOR_NAME,
  publisher: SITE_AUTHOR_NAME,
  robots: getDefaultRobotsMetadata(),
  openGraph: {
    type: "website",
    url: "/",
    title: SITE_BRAND_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_BRAND_NAME,
    locale: SITE_OG_LOCALE,
    images: [createMetadataImage(DEFAULT_OG_IMAGE_PATH, SITE_BRAND_NAME)],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_BRAND_NAME,
    description: SITE_DESCRIPTION,
    creator: SITE_AUTHOR_NAME,
    images: [createMetadataImage(DEFAULT_OG_IMAGE_PATH, SITE_BRAND_NAME)],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${jetbrainsMono.variable} antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col font-mono bg-black text-neutral-400 selection:bg-neutral-800 selection:text-neutral-200">
        <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 md:py-20 lg:px-8 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
