"use client";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { Courier_Prime } from "next/font/google";

const courierPrime = Courier_Prime({ subsets: ["latin"], weight: "400" });

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="h-[80px] px-[50px] bg-white text-black flex items-center justify-between border-b border-gray-200">
      <Link href="/" className="text-xl">
        <span className="font-inter font-semibold">portfolio</span>
        <span className="font-courier-prime font-light"> hunt</span>
      </Link>
      <div>
        <Link href="/upload" className="mr-4">Upload</Link>
        {user ? (
          <button onClick={handleLogout} className="mr-4">Logout</button>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}