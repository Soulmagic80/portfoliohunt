"use client";
import { supabase } from "../lib/supabase";
import { useState } from "react";

const positiveOptions = ["Starke Typografie", "Kreative Layouts", "Beeindruckende Farbwahl"];
const negativeOptions = ["Zu wenig Kontrast", "Überladene Designs", "Fehlende Klarheit"];

export default function FeedbackForm({ portfolioId }: { portfolioId: string }) {
  const [positive, setPositive] = useState("");
  const [negative, setNegative] = useState("");
  const [optionalText, setOptionalText] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setMessage("Bitte melde dich an, um Feedback zu geben!");
      return;
    }

    // Prüfe, ob User schon Feedback gegeben hat
    const { data: feedbackGiven, error: feedbackError } = await supabase
      .from("feedback")
      .select("id")
      .eq("user_id", userData.user.id)
      .limit(1);

    if (feedbackError || !feedbackGiven.length) {
      setMessage("Gib zuerst Feedback zu einem anderen Portfolio!");
      return;
    }

    const { error } = await supabase
      .from("feedback")
      .insert({
        portfolio_id: portfolioId,
        user_id: userData.user.id,
        positive,
        negative,
        optional_text: optionalText || undefined,
      });

    if (error) {
      setMessage("Fehler: " + error.message);
    } else {
      setMessage("Feedback gesendet!");
      setPositive("");
      setNegative("");
      setOptionalText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <select
        value={positive}
        onChange={(e) => setPositive(e.target.value)}
        className="border p-2 w-full rounded"
        required
      >
        <option value="">Positiv wählen</option>
        {positiveOptions.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <select
        value={negative}
        onChange={(e) => setNegative(e.target.value)}
        className="border p-2 w-full rounded"
        required
      >
        <option value="">Negativ wählen</option>
        {negativeOptions.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <textarea
        value={optionalText}
        onChange={(e) => setOptionalText(e.target.value)}
        placeholder="Optionaler Kommentar"
        className="border p-2 w-full rounded"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
        Feedback geben
      </button>
      {message && <p className="mt-2 text-center">{message}</p>}
    </form>
  );
}