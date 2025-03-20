"use client";
import "./globals.css";
import Navbar from "../components/Navbar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <html lang="de" className="h-full">
      <body className="h-full font-geist">
        {pathname !== "/login" && <Navbar />}
        <div className={`max-w-full mx-auto p-6 ${pathname !== "/login" ? "pt-16" : ""}`}>
          {children}
        </div>
      </body>
    </html>
  );
}