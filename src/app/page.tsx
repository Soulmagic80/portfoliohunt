"use client";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import PortfolioCard from "../components/PortfolioCard";
import SegmentControl from "../components/SegmentControl";
import { Portfolio } from "../types";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("new");
  const [newPortfolios, setNewPortfolios] = useState<Portfolio[]>([]);
  const [allTimePortfolios, setAllTimePortfolios] = useState<Portfolio[]>([]);
  const [user, setUser] = useState<User | null>(null);

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
    <main className="w-full bg-white p-10 text-left">

<div className="w-full h-[360px] flex flex-col items-center justify-center gap-5">
        <h1 className="text-5xl font-inter font-bold leading-[110%] text-center uppercase max-w-[550px]">
        Challenge the best, help everyone else
        </h1>
        <p className="text-lg font-inter font-light leading-[150%] text-center mt-4 text-gray-500 max-w-[540px]">
        A new home for digital design portfolios. Upvote portfolios you like, rate other portfolios and get real feedback on your own.
        </p>
      </div>



   {/* Segment Control */}
   <SegmentControl activeFilter={activeFilter} setActiveFilter={setActiveFilter} />


      <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-6">
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
  );
}