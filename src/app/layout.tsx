import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";
import { WalletProvider } from "@/context/WalletContext";
import { ErrorProvider } from "@/context/ErrorContext";
import GlobalErrorDisplay from "@/components/GlobalErrorDisplay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stellar Auction House",
  description: "Real-time auction application on Stellar Soroban",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorProvider>
          <WalletProvider>
            <Layout>{children}</Layout>
            <GlobalErrorDisplay />
          </WalletProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}
