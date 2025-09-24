import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Footer from "@/components/features/common/footer";
import Navbar from "@/components/features/common/navbar";
import { Toaster } from "@/components/ui/sonner";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} antialiased`}>
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableSystem
          >
            <Navbar />
            <NuqsAdapter>{children}</NuqsAdapter>
            <Footer />
            <Toaster richColors />
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
