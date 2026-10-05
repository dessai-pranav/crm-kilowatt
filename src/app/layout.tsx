import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kilowatt CRM - AI-Powered WooCommerce Intelligence",
  description: "AI-Powered CRM system with deep WooCommerce integration, customer 360 profiles, RFM segmentation, workflows, and AI Copilot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
