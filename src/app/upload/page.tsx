"use client"; // Client-seitig, wegen Formular
import { supabase } from "../../lib/supabase";
import { useState } from "react";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setMessage("Bitte melde dich an, um hochzuladen!");
      return;
    }

    const { error } = await supabase
      .from("portfolios")
      .insert({
        title,
        description,
        image_url: imageUrl,
        user_id: userData.user.id,
      });

    if (error) {
      setMessage("Fehler: " + error.message);
    } else {
      setMessage("Portfolio hochgeladen!");
      setTitle("");
      setDescription("");
      setImageUrl("");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Portfolio hochladen</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titel"
          className="border p-2 w-full rounded"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Beschreibung"
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Bild-URL"
          className="border p-2 w-full rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
          Hochladen
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}