import "./globals.css";
import Navbar from "../components/Navbar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portfoliohunt",
  description: "A platform for designers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <Navbar />
        <main className="w-full">{children}</main>
      </body>
    </html>
  );
}