"use client";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
    <nav className="h-[72px] px-[50px] bg-white text-black flex items-center justify-between border-b border-gray-600">
      {/* Logo links */}
      <Link href="/">
        <Image src="/logo.svg" alt="Portfoliohunt Logo" width={130} height={0} style={{ height: "auto" }} />
      </Link>

      {/* Buttons rechts */}
      <div className="flex gap-4">
        <Link
          href="/upload"
          className="flex items-center gap-2 px-4 py-[5px] font-inter text-[13px] text-black bg-white border border-[#EBE5DF] rounded-lg hover:bg-gray-100"
        >
          <Image src="/upload-icon.svg" alt="Upload Icon" width={12} height={12} />
          Upload
        </Link>
        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-[5px] font-inter text-[13px] text-black bg-[#F5F2F0] rounded-lg hover:bg-gray-200"
          >
            <Image src="/logout-icon.svg" alt="Logout Icon" width={12} height={12} />
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-[5px] font-inter text-[13px] text-black bg-[#F5F2F0] rounded-lg hover:bg-gray-200"
          >
            <Image src="/login-icon.svg" alt="Login Icon" width={12} height={12} />
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}