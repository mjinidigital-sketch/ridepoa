// For adding custom fonts with other frameworks, see:
// https://tailwindcss.com/docs/font-family
import type { Metadata } from "next";
import { Poppins, Libre_Baskerville, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import { TooltipProvider } from "@/components/ui/tooltip"
import ConvexClientProvider from "./ConvexClientProvider";

const fontSans = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: "400"
});

const fontSerif = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400"
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: "400"
});

export const metadata: Metadata = {
  title: "RidePoa",
  description: "Welcome to RidePoa - Your Premier Car Rental Service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}>
        <TooltipProvider><ConvexClientProvider>{children}</ConvexClientProvider></TooltipProvider>
      </body>
    </html>
  );
}