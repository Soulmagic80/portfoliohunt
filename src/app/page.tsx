"use client";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import PortfolioCard from "../components/PortfolioCard";
import { Portfolio } from "../types";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("new"); // "new" oder "all"
  const [newPortfolios, setNewPortfolios] = useState<Portfolio[]>([]);
  const [allTimePortfolios, setAllTimePortfolios] = useState<Portfolio[]>([]);
  const [user, setUser] = useState<User | null>(null); // User für Auth

  // Daten und User holen
  useEffect(() => {
    async function fetchData() {
      // User prüfen
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      // New This Month: Letzte 30 Tage
      const { data: newData, error: newError } = await supabase
        .from("portfolios")
        .select("*")
        .gte("created_at", new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString())
        .order("upvotes", { ascending: false });

      // All Time Ranking
      const { data: allData, error: allError } = await supabase
        .from("portfolios")
        .select("*")
        .order("upvotes", { ascending: false });

      if (!newError) setNewPortfolios(newData || []);
      if (!allError) setAllTimePortfolios(allData || []);
    }
    fetchData();
  }, []);

  // Upvote-Funktion
  const handleUpvote = async (portfolioId: string) => {
    const { data: currentPortfolio, error: fetchError } = await supabase
      .from("portfolios")
      .select("upvotes")
      .eq("id", portfolioId)
      .single();

    if (fetchError) {
      console.error("Fetch failed:", fetchError.message);
      return;
    }

    const newUpvotes = currentPortfolio.upvotes + 1;

    const { error } = await supabase
      .from("portfolios")
      .update({ upvotes: newUpvotes })
      .eq("id", portfolioId);

    if (!error) {
      // Listen aktualisieren
      setNewPortfolios((prev) =>
        prev.map((p) => (p.id === portfolioId ? { ...p, upvotes: p.upvotes + 1 } : p)).sort((a, b) => b.upvotes - a.upvotes)
      );
      setAllTimePortfolios((prev) =>
        prev.map((p) => (p.id === portfolioId ? { ...p, upvotes: p.upvotes + 1 } : p)).sort((a, b) => b.upvotes - a.upvotes)
      );
    } else {
      console.error("Upvote failed:", error.message);
    }
  };

  return (
    <div className="container mx-auto py-8">
      {/* Titel */}
      <h1 className="text-4xl font-bold text-center mb-8">Portfoliohunt</h1>

      {/* Segment Control */}
      <div className="inline-flex h-9 w-full items-baseline justify-start rounded-lg bg-gray-100 p-1 sm:w-auto mb-6">
        <button
          type="button"
          onClick={() => setActiveFilter("new")}
          className={`group inline-flex items-center justify-center whitespace-nowrap py-2 font-semibold transition-all duration-300 ease-in-out min-w-[32px] text-xs h-7 w-full px-3 sm:w-auto ${
            activeFilter === "new"
              ? "rounded-md bg-white shadow text-slate-950"
              : "bg-transparent text-slate-600 hover:text-blue-950"
          }`}
        >
          New This Month
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={`group inline-flex items-center justify-center whitespace-nowrap py-2 font-semibold transition-all duration-300 ease-in-out min-w-[32px] text-xs h-7 w-full px-3 sm:w-auto ${
            activeFilter === "all"
              ? "rounded-md bg-white shadow text-slate-950"
              : "bg-transparent text-slate-600 hover:text-blue-950"
          }`}
        >
          All Time
        </button>
      </div>

      {/* Portfolio-Listen */}
      <div className="mt-6">
        {activeFilter === "new" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newPortfolios.map((p) => (
              <PortfolioCard key={p.id} portfolio={p} user={user} onUpvote={handleUpvote} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allTimePortfolios.map((p) => (
              <PortfolioCard key={p.id} portfolio={p} user={user} onUpvote={handleUpvote} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}