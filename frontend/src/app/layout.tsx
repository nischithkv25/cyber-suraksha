import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import AIChatbot from "@/components/ui/AIChatbot";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cyber Suraksha | Protect. Detect. Report.",
  description: "AI-Powered Cybercrime Protection Platform for Indian Citizens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${orbitron.variable} antialiased bg-background text-foreground`}
      >
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
        <AIChatbot />
      </body>
    </html>
  );
}
