"use client";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
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
        <a href="/" className="text-xl font-bold">Portfoliohunt</a>
        <div>
          <a href="/portfolios" className="mr-4">Portfolios</a>
          <a href="/upload" className="mr-4">Upload</a>
          {user ? (
            <button onClick={handleLogout} className="mr-4">Logout</button>
          ) : (
            <a href="/login">Login</a>
          )}
        </div>
      </div>
    </nav>
  );
}