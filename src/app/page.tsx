"use client";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import PortfolioCard from "../components/PortfolioCard";
import { Portfolio } from "../types";
import { User } from "@supabase/supabase-js";
import Navbar from "../components/Navbar"; // Annahme: Deine Navbar-Komponente

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("new"); // "new" oder "all"
  const [newPortfolios, setNewPortfolios] = useState<Portfolio[]>([]);
  const [allTimePortfolios, setAllTimePortfolios] = useState<Portfolio[]>([]);
  const [user, setUser] = useState<User | null>(null); // User für Auth

  // Daten und User holen
  useEffect(() => {
    async function fetchData() {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

      const { data: newData, error: newError } = await supabase
        .from("portfolios")
        .select("*")
        .gte("created_at", new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString())
        .order("upvotes", { ascending: false });

      const { data: allData, error: allError } = await supabase
        .from("portfolios")
        .select("*")
        .order("upvotes", { ascending: false });

      if (!newError) setNewPortfolios(newData || []);
      if (!allError) setAllTimePortfolios(allData || []);
    }
    fetchData();
  }, []);

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
    <div className="flex flex-col min-h-screen">


      {/* Hauptbereich mit zwei Teilen */}
      <div className="flex flex-1">
        {/* Linker Bereich (Content) */}
        <main className="w-5/6 bg-white p-8 text-left">
          {/* Titel */}

          {/* Segment Control */}
          <div className="flex w-full max-w-md rounded-lg bg-gray-100 p-1 mb-8">
            <button
              onClick={() => setActiveFilter("new")}
              className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${
                activeFilter === "new" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              New This Month
            </button>
            <button
              onClick={() => setActiveFilter("all")}
              className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-colors ${
                activeFilter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Time
            </button>
          </div>

          {/* Portfolio-Listen */}
          <div className="flex flex-col gap-8">
            {activeFilter === "new" ? (
              newPortfolios.map((p) => (
                <PortfolioCard key={p.id} portfolio={p} user={user} onUpvote={handleUpvote} />
              ))
            ) : (
              allTimePortfolios.map((p) => (
                <PortfolioCard key={p.id} portfolio={p} user={user} onUpvote={handleUpvote} />
              ))
            )}
          </div>
        </main>

        {/* Graue Trennlinie */}
        <div className="w-px bg-gray-200"></div>

        {/* Rechter Bereich (Leer) */}
        <aside className="w-1/6 bg-white p-8">
          {/* Platzhalter für späteren Inhalt */}
          <p className="text-gray-500">Leer – später zu füllen</p>
        </aside>
      </div>
    </div>
  );
}