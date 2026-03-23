import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "latin-ext", "vietnamese"],
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
