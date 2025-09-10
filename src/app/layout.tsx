import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { TRPCProvider } from "@/trpc/client";
import "./globals.css";
import Navbar from "@/components/features/common/navbar";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Agri LMS",
    template: "%s | Agri LMS",
  },
  description: "Agri LMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>
        <TRPCProvider>
          <Navbar />
          {children}
        </TRPCProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
