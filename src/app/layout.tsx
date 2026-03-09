import type { Metadata } from "next";
import { Space_Grotesk, Syncopate } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { StarField } from "@/components/StarField";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

const syncopate = Syncopate({
  subsets: ["latin"],
  variable: "--font-syncopate",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "SATURN AI | Elite Career Engineering",
  description: "High-fidelity terminal for elite professional status. Reconstruct your narrative with Saturn's Cognitive Intelligence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${syncopate.variable} antialiased`}
      >
        <Toaster position="top-center" richColors />
        <StarField />
        <Providers>
          <Header />
          <main className="app-main">{children}</main>
          <Footer />
          <ChatBot />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
