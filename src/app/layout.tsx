import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PortalProvider } from "@/context/PortalContext";
import { ToastProvider } from "@/context/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Madarasah Badru-diin - Educational Portal",
  description: "Experience modern, premium madrasa and school education. Track academic progress, view detailed marksheets, and manage student fee ledgers in an elegant, modern portal.",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><path d="M50 5C50 5 85 20 85 50C85 75 70 90 50 95C30 90 15 75 15 50C15 20 50 5 50 5Z" stroke="%2310b981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="%2310b981" fill-opacity="0.05"/><path d="M47 18C47 18 51.5 15 55 18C52.5 19.5 52.5 22.5 55 24C51.5 27 47 24 47 24" stroke="%2310b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="50" y1="25" x2="50" y2="33" stroke="%2310b981" stroke-width="3.5" stroke-linecap="round"/><path d="M50 62C50 62 40 50 25 53V72C40 69 50 78 50 78C50 78 60 69 75 72V53C60 50 50 62 50 62Z" fill="%2310b981" fill-opacity="0.2" stroke="%2310b981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="50" y1="62" x2="50" y2="78" stroke="%2310b981" stroke-width="3.5" stroke-linecap="round"/><path d="M50 38C48 42 45 46 45 50C45 52.76 47.24 55 50 55C52.76 55 55 52.76 55 50C55 46 52 42 50 38Z" fill="%2310b981" stroke="%2310b981" stroke-width="2" stroke-linejoin="round"/></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-400">
        <PortalProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </PortalProvider>
      </body>
    </html>
  );
}

