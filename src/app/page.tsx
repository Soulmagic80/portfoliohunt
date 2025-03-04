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
    <div className="flex flex-row flex-1">
      {/* Hauptbereich */}
      <main className="w-full bg-white p-10 text-left">
        <h1 className="text-4xl font-bold mb-8">Portfoliohunt</h1>

        {/* Segment Control */}
        <div className="flex w-full max-w-md rounded-lg bg-gray-100 p-1 mb-6">
          <button
            onClick={() => setActiveFilter("new")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeFilter === "new" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            New This Month
          </button>
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeFilter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Time
          </button>
        </div>

        {/* Portfolio-Karten im Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeFilter === "new"
            ? newPortfolios.map((p, index) => (
                <PortfolioCard
                  key={p.id}
                  portfolio={p}
                  user={user}
                  onUpvote={handleUpvote}
                  rank={index + 1}
                />
              ))
            : allTimePortfolios.map((p, index) => (
                <PortfolioCard
                  key={p.id}
                  portfolio={p}
                  user={user}
                  onUpvote={handleUpvote}
                  rank={index + 1}
                />
              ))}
        </div>
      </main>
    </div>
  );
}