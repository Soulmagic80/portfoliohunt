"use client";
import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Account() {
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      const username = data.user.user_metadata?.username || data.user.email?.split("@")[0];
      setUserName(username || "User");
      setUserId(data.user.id);
    };
    fetchUser();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Vorschau im Browser
    }
  };

  const handleUpload = async () => {
    if (!avatarFile || !userId) return;

    const fileExt = avatarFile.name.split(".").pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, { upsert: true }); // Überschreibt vorhandenes Bild

    if (error) {
      console.error("Upload failed:", error.message);
    } else {
      setAvatarFile(null);
      setAvatarPreview(null);
      alert("Avatar successfully uploaded!");
    }
  };

  const avatarPath = userId
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${userId}/avatar.jpg`
    : null;

  return (
    <div className="max-w-[1280px] mx-auto p-6">
      <h1 className="text-3xl font-inter font-bold text-gray-900 mb-6">Account</h1>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-inter font-semibold text-gray-900 mb-2">Profile</h2>
          <p className="text-gray-600">Username: {userName}</p>
        </div>
        <div>
          <h2 className="text-xl font-inter font-semibold text-gray-900 mb-2">Avatar</h2>
          <div className="flex items-center gap-4">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar Preview"
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : avatarPath ? (
              <Image
                src={avatarPath}
                alt="User Avatar"
                width={64}
                height={64}
                className="rounded-full"
                onError={() => {}}
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold text-xl">
                {userName?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mb-2"
              />
              {avatarFile && (
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Upload Avatar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}