"use client";
import { supabase } from "../lib/supabase";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Sidebar, SidebarBody, SidebarSection, SidebarItem } from "@/components/TWP/sidebar";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarExt, setAvatarExt] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const fetchUserData = async (user: any) => {
    try {
      if (user) {
        setIsLoggedIn(true);
        const username = user.user_metadata?.username || user.email?.split("@")[0];
        setUserName(username || "User");
        setUserId(user.id);

        const { data: files, error } = await supabase.storage
          .from("avatars")
          .list(user.id, { limit: 1, search: "avatar" });
        if (error) throw error;
        if (files && files.length > 0) {
          setAvatarExt(files[0].name.split(".").pop());
        }
      } else {
        setIsLoggedIn(false);
        setUserName(null);
        setUserId(null);
        setAvatarExt(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoggedIn(false);
      setUserName(null);
      setUserId(null);
      setAvatarExt(null);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      fetchUserData(data.user);
    };
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      fetchUserData(session?.user);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Schließe das Menü bei Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const Avatar = () => {
    const avatarPath = userId && avatarExt
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${userId}/avatar.${avatarExt}`
      : null;
    if (avatarPath) {
      return (
        <Image
          src={avatarPath}
          alt="User Avatar"
          width={32}
          height={32}
          className="rounded-full border-2 border-black"
          onError={() => setAvatarExt(null)}
        />
      );
    }
    const initial = userName ? userName.charAt(0).toUpperCase() : "U";
    return (
      <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center bg-tremor-background text-tremor-content-strong font-bold text-lg">
        {initial}
      </div>
    );
  };

  const toggleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 h-16 bg-tremor-background border-b border-tremor-border">
      <div className="max-w-full mx-auto flex items-center justify-between px-6 h-full">
        <Link href="/">
          <Image src="/logo.svg" alt="Portfoliohunt Logo" width={120} height={29.54} priority />
        </Link>

        {/* Hamburger-Menü für kleinere Bildschirme */}
        <div className="lg:hidden">
          <button
            ref={hamburgerRef}
            onClick={toggleMenu}
            className="flex flex-col gap-1.5 w-8 h-8 justify-center items-center"
            aria-label="Toggle menu"
          >
            <span
              className={`w-6 h-0.5 bg-tremor-content-strong transition-transform duration-300 ease-in-out ${
                isMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-tremor-content-strong transition-opacity duration-300 ease-in-out ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-tremor-content-strong transition-transform duration-300 ease-in-out ${
                isMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            ></span>
          </button>

          {/* Menü-Inhalt für kleinere Bildschirme */}
          {isMenuOpen && (
            <div ref={menuRef}>
              <Sidebar className="fixed top-16 left-0 w-full bg-tremor-background border-b border-tremor-border z-40">
                <SidebarBody>
                  <SidebarSection>
                    <SidebarItem href="/help">
                      <span className="text-tremor-default font-medium text-tremor-content-strong hover:text-tremor-brand">
                        Help
                      </span>
                    </SidebarItem>
                    <SidebarItem href="/getting-started">
                      <span className="text-tremor-default font-medium text-tremor-content-strong hover:text-tremor-brand">
                        Getting started
                      </span>
                    </SidebarItem>
                    {isLoggedIn ? (
                      <div className="flex items-center gap-4 p-4">
                        <Avatar />
                        <button
                          onClick={handleLogout}
                          className="px-4 py-2 rounded-tremor-default bg-tremor-brand text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis text-tremor-default font-medium"
                        >
                          Logout
                        </button>
                      </div>
                    ) : (
                      <SidebarItem href="/login">
                        <span className="text-tremor-default font-medium text-tremor-content-strong hover:text-tremor-brand">
                          Sign in
                        </span>
                      </SidebarItem>
                    )}
                  </SidebarSection>
                </SidebarBody>
              </Sidebar>
            </div>
          )}
        </div>

        {/* Links und Button für größere Bildschirme */}
        <div className="hidden lg:flex items-center gap-6">
          <Link
            href="/help"
            className="text-tremor-default font-medium text-tremor-content-strong hover:text-tremor-brand"
          >
            Help
          </Link>
          <Link
            href="/getting-started"
            className="text-tremor-default font-medium text-tremor-content-strong hover:text-tremor-brand"
          >
            Getting started
          </Link>
          {isLoggedIn ? (
            <div className="flex items-center gap-6">
              <Avatar />
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-tremor-default bg-tremor-brand text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis text-tremor-default font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-tremor-default bg-tremor-brand text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis text-tremor-default font-medium"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}