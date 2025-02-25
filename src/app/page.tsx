"use client";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Portfolio } from "../types"; // Typ importieren

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("new"); // "new" oder "all"
  const [newPortfolios, setNewPortfolios] = useState<Portfolio[]>([]); // Portfolio-Typ
  const [allTimePortfolios, setAllTimePortfolios] = useState<Portfolio[]>([]); // Portfolio-Typ

  // Daten von Supabase holen
  useEffect(() => {
    async function fetchPortfolios() {
      // New This Month: Letzte 30 Tage
      const { data: newData, error: newError } = await supabase
        .from("portfolios")
        .select("*")
        .gte("created_at", new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString())
        .order("created_at", { ascending: false });

      // All Time Ranking
      const { data: allData, error: allError } = await supabase
        .from("portfolios")
        .select("*")
        .order("upvotes", { ascending: false });

      if (!newError) setNewPortfolios(newData || []);
      if (!allError) setAllTimePortfolios(allData || []);
    }
    fetchPortfolios();
  }, []);

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
              <div key={p.id} className="border p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800">{p.title}</h2>
                <p className="text-gray-600 mt-2">{p.description}</p>
                <p className="mt-2 text-blue-500">{p.upvotes} Upvotes</p>
                <Link href={`/portfolios/${p.id}`} className="mt-2 text-blue-600 hover:underline">
                  Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allTimePortfolios.map((p) => (
              <div key={p.id} className="border p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800">{p.title}</h2>
                <p className="text-gray-600 mt-2">{p.description}</p>
                <p className="mt-2 text-blue-500">{p.upvotes} Upvotes</p>
                <Link href={`/portfolios/${p.id}`} className="mt-2 text-blue-600 hover:underline">
                  Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}