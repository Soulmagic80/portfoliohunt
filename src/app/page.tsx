"use client";
import { supabase } from "../lib/supabase";
import { useState, useEffect, useRef } from "react";
import PortfolioCard from "../components/PortfolioCard";
import SegmentControl from "../components/SegmentControl";
import { Portfolio } from "../types";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("new");
  const [newPortfolios, setNewPortfolios] = useState<Portfolio[]>([]);
  const [allTimePortfolios, setAllTimePortfolios] = useState<Portfolio[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [newPage, setNewPage] = useState(0);
  const [allTimePage, setAllTimePage] = useState(0);
  const [hasMoreNew, setHasMoreNew] = useState(true);
  const [hasMoreAllTime, setHasMoreAllTime] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    async function fetchData() {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);
      await fetchPortfolios("new", 0);
      await fetchPortfolios("all", 0);
    }
    fetchData();
  }, []);

  const fetchPortfolios = async (filter: string, page: number) => {
    const query = supabase
      .from("portfolios")
      .select("*")
      .order("upvotes", { ascending: false })
      .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

    if (filter === "new") {
      query.gte("created_at", new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString());
    }

    const { data, error } = await query;

    if (!error && data) {
      if (filter === "new") {
        setNewPortfolios((prev) => {
          const updated = [...prev, ...data];
          const uniquePortfolios = Array.from(new Map(updated.map((p) => [p.id, p])).values());
          return uniquePortfolios;
        });
        setHasMoreNew(data.length === ITEMS_PER_PAGE);
      } else {
        setAllTimePortfolios((prev) => {
          const updated = [...prev, ...data];
          const uniquePortfolios = Array.from(new Map(updated.map((p) => [p.id, p])).values());
          return uniquePortfolios;
        });
        setHasMoreAllTime(data.length === ITEMS_PER_PAGE);
      }
    }
  };

  const handleUpvote = async (portfolioId: string) => {
    if (!user) return;
  
    const isAdmin = user.email === "admin@example.com";
  
    if (!isAdmin) {
      const { data: existingVote, error: voteError } = await supabase
        .from("upvotes")
        .select("id")
        .eq("user_id", user.id)
        .eq("portfolio_id", portfolioId)
        .single();
  
      if (voteError && voteError.code !== "PGRST116") {
        console.error("Vote check failed:", voteError.message);
        return;
      }
  
      if (existingVote) {
        console.log("User has already upvoted this portfolio");
        return;
      }
  
      const { error: insertError } = await supabase
        .from("upvotes")
        .insert({ user_id: user.id, portfolio_id: portfolioId });
  
      if (insertError) {
        console.error("Insert vote failed:", insertError.message);
        return;
      }
    }
  
    // Upvote erhöhen
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
  
    const { error: updateError } = await supabase
      .from("portfolios")
      .update({ upvotes: newUpvotes })
      .eq("id", portfolioId);
  
    if (updateError) {
      console.error("Upvote failed:", updateError.message);
      return;
    }
  
    // Alle Portfolios laden und Ränge berechnen
    const { data: allPortfolios, error: allError } = await supabase
      .from("portfolios")
      .select("*")
      .order("upvotes", { ascending: false });
  
    if (allError) {
      console.error("Fetch all portfolios failed:", allError.message);
      return;
    }
  
    // All Time Ränge
    const allTimeRanked = allPortfolios.map((p, index) => ({
      ...p,
      rank_all_time: index + 1,
    }));
  
    // New This Month Ränge
    const newThisMonth = allPortfolios.filter(
      (p) => new Date(p.created_at) >= new Date(new Date().setMonth(new Date().getMonth() - 1))
    );
    const newRanked = allTimeRanked.map((p) => ({
      ...p, // Alle Felder übernehmen, inkl. title
      rank_new: newThisMonth.findIndex((np) => np.id === p.id) >= 0 ? newThisMonth.findIndex((np) => np.id === p.id) + 1 : null,
    }));
  
    // Ränge in DB aktualisieren
    const { error: rankUpdateError } = await supabase.from("portfolios").upsert(newRanked, {
      onConflict: "id",
      ignoreDuplicates: false,
    });
  
    if (rankUpdateError) {
      console.error("Rank update failed:", rankUpdateError.message);
      return;
    }
  
    // Lokale State-Aktualisierung
    setNewPortfolios((prev) =>
      prev.map((p) => (p.id === portfolioId ? { ...p, upvotes: p.upvotes + 1, rank_new: newRanked.find(r => r.id === p.id)?.rank_new } : p)).sort((a, b) => b.upvotes - a.upvotes)
    );
    setAllTimePortfolios((prev) =>
      prev.map((p) => (p.id === portfolioId ? { ...p, upvotes: p.upvotes + 1, rank_all_time: newRanked.find(r => r.id === p.id)?.rank_all_time } : p)).sort((a, b) => b.upvotes - a.upvotes)
    );
  };

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (activeFilter === "new" && hasMoreNew) {
            const nextPage = newPage + 1;
            setNewPage(nextPage);
            fetchPortfolios("new", nextPage);
          } else if (activeFilter === "all" && hasMoreAllTime) {
            const nextPage = allTimePage + 1;
            setAllTimePage(nextPage);
            fetchPortfolios("all", nextPage);
          }
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [activeFilter, newPage, allTimePage, hasMoreNew, hasMoreAllTime]);

  return (
    <main className="w-full mx-auto bg-white">
      <div className="w-full h-[380px] flex flex-col items-center justify-center gap-2">
      <p className="pb-4 text-tremor-default text-[13px] text-tremor-brand uppercase font-normal leading-[150%] tracking-[0.03em] mt-4 mb-4 max-w-[540px]">
          A new home for digital portfolios
        </p>
        <h1 className="text-4xl font-bold max-w-[700px] text-center text-balance tracking-[-0.03em] leading-[120%]">
        Challenge the best, get valuable feedback, improve, and help others.
        </h1>
        <p className="text-[17px] text-balance text-tremor-default leading-[150%] mt-6 text-gray-500 text-center max-w-[540px] pb-8">
        Submit your portfolio, upvote, comment on, and rate other portfolios, and get real and helpful feedback on your own.
        </p>
      </div>

      {/* Segment Control */}
      <SegmentControl activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

      {/* Portfolio-Listen */}
      <div className="pt-4 pb-10 grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-6">
        {activeFilter === "new"
          ? newPortfolios.map((p) => (
              <PortfolioCard
                key={p.id}
                portfolio={p}
                user={user}
                onUpvote={handleUpvote}
                rank={newPortfolios.indexOf(p) + 1}
              />
            ))
          : allTimePortfolios.map((p) => (
              <PortfolioCard
                key={p.id}
                portfolio={p}
                user={user}
                onUpvote={handleUpvote}
                rank={allTimePortfolios.indexOf(p) + 1}
              />
            ))}
        {(activeFilter === "new" ? hasMoreNew : hasMoreAllTime) && (
          <div ref={loadMoreRef} className="h-10 w-full flex justify-center items-center">
            Loading more...
          </div>
        )}
      </div>
    </main>
  );
}
