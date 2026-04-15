import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "./components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Facial recognition | Enrollment & matching",
  description:
    "Register individuals with portrait and profile data, then match faces in new photos or video against your gallery using embedding-based similarity search.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-dvh overflow-hidden antialiased`}
    >
      <body className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--page-bg)] font-sans text-slate-900">
        <SiteHeader />
        {/* Single scroll container: avoids document-level overflow from dvh/flex/min-height quirks */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-clip overscroll-y-contain">
          {children}
        </div>
      </body>
    </html>
  );
}
