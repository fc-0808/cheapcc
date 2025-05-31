import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Cheap CC",
  description: "Affordable Adobe Creative Cloud subscriptions for everyone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* Preconnect to PayPal domains to improve loading performance */}
        <link rel="preconnect" href="https://www.paypal.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.sandbox.paypal.com" crossOrigin="anonymous" />
        {/* Font Awesome for icons */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" integrity="sha512-Avb2QiuDEEvB4bZJYdft2mNjVShBftLdPG8FJ0V7irTLQ8Uo0qcPxh4Plq7G5tGm0rU+1SPhVotteLpBERwTkw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body className="antialiased bg-white text-[#171717]">
        {/* Header - always logged out state for server component */}
        <Header />
        {/* Main Content */}
        {children}
        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
