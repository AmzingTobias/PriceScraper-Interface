import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/ui/toast";
import NavBar from "@/components/nav/nav-bar";
import AdminPopup from "@/components/admin/admin-popup";

export const metadata: Metadata = {
  title: "PriceScraper",
  description: "Price scraper for digital games — track prices and get notified on drops.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <AuthProvider>
          <ToastProvider>
            <NavBar />
            <main className="pb-24">{children}</main>
            <AdminPopup />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
