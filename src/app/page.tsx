"use client";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import PortfolioCard from "../components/PortfolioCard";
import { Portfolio } from "../types";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("new"); // "new" oder "all"
  const [newPortfolios, setNewPortfolios] = useState<Portfolio[]>([]);
  const [allTimePortfolios, setAllTimePortfolios] = useState<Portfolio[]>([]);
  const [user, setUser] = useState<any>(null); // User für Auth

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
        .order("upvotes", { ascending: false }); // Nach Upvotes sortieren

      // All Time Ranking
      const { data: allData, error: allError } = await supabase
        .from("portfolios")
        .select("*")
        .order("upvotes", { ascending: false }); // Nach Upvotes sortieren

      if (!newError) setNewPortfolios(newData || []);
      if (!allError) setAllTimePortfolios(allData || []);
    }
    fetchData();
  }, []);

  // Upvote-Funktion
  const handleUpvote = async (portfolioId: string) => {
    const { data, error } = await supabase
      .from("portfolios")
      .update({ upvotes: supabase.rpc("increment", { row: "upvotes" }) })
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

      {/* Filterleiste */}
      <div>
        {/* Dropdown für kleine Bildschirme */}
        <div className="sm:hidden">
          <label htmlFor="Tab" className="sr-only">Tab</label>
          <select
            id="Tab"
            className="w-full rounded-md border-gray-200"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
          >
            <option value="new">New This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Tabs für größere Bildschirme */}
        <div className="hidden sm:block">
          <nav className="flex gap-6" aria-label="Tabs">
            <button
              onClick={() => setActiveFilter("new")}
              className={`shrink-0 rounded-lg p-2 text-sm font-medium ${
                activeFilter === "new"
                  ? "bg-sky-100 text-sky-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
              aria-current={activeFilter === "new" ? "page" : undefined}
            >
              New This Month
            </button>
            <button
              onClick={() => setActiveFilter("all")}
              className={`shrink-0 rounded-lg p-2 text-sm font-medium ${
                activeFilter === "all"
                  ? "bg-sky-100 text-sky-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
              aria-current={activeFilter === "all" ? "page" : undefined}
            >
              All Time
            </button>
          </nav>
        </div>
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