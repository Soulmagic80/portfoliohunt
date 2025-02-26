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
    <nav className="bg-white text-gray-900 pl-8 pr-8 pt-4 pb-4 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-l font-Semibold">Portfoliohunt</Link>
        <div className="space-x-4">
          <Link href="/upload" className="hover:text-gray-700">Upload</Link>
          {user ? (
            <button onClick={handleLogout} className="hover:text-gray-700">Logout</button>
          ) : (
            <Link href="/login" className="hover:text-gray-700">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}