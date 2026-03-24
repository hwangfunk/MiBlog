import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";

const jetbrainsMono = localFont({
  variable: "--font-jetbrains",
  src: [
    { path: "../../public/fonts/jetbrains-mono-latin-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/jetbrains-mono-latin-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/jetbrains-mono-latin-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "qanx._.minhhh blog",
  description: "\"just raw !\"",
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
