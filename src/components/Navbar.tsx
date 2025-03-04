"use client";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

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
      <Link href="/" className="text-xl flex space-x-1 pt-2">
        <span className="font-inter font-semibold text-[20px] leading-none">portfolio</span>
        <span className="font-courier-prime font-light text-[22px] leading-[1.15]">hunt</span>
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