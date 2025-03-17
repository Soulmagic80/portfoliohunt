"use client";
import { supabase } from "../../lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Upload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [tags, setTags] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      router.push("/login");
      return;
    }

    const isAdmin = userData.user.email === "admin@example.com";
    const userId = isAdmin ? "550e8400-e29b-41d4-a716-446655440000" : userData.user.id; // Feste ID für Admin

    let imagePath = null;
    if (image) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("portfolio-images")
        .upload(`${userId}/${Date.now()}-${image.name}`, image);
      if (uploadError) {
        console.error("Upload failed:", uploadError.message);
        return;
      }
      imagePath = uploadData.path;
    }

    const { error } = await supabase
      .from("portfolios")
      .insert({
        title,
        description,
        user_id: userId,
        image: imagePath,
        tags: tags.split(",").map((tag) => tag.trim()),
        upvotes: 0,
      });

    if (!error) {
      router.push("/");
    } else {
      console.error("Insert failed:", error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Portfolio</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block">Image</label>
          <input
            type="file"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block">Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g. UI, UX, Design"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Upload
        </button>
      </form>
    </div>
  );
}