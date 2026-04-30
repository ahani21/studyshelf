import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "StudyShelf",
  description: "Save smarter. Study deeper.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} ${lora.variable} h-full antialiased`}
      >
        <body className="app-main min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
