"use client";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js"; // Typ von Supabase importieren

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null); // Typisiert als User oder null
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
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <Link href="/" className="text-xl font-bold">Portfoliohunt</Link>
        <div>
          <Link href="/portfolios" className="mr-4">Portfolios</Link>
          <Link href="/upload" className="mr-4">Upload</Link>
          {user ? (
            <button onClick={handleLogout} className="mr-4">Logout</button>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}