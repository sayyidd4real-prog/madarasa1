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

