import { supabase } from "../../lib/supabase";

export default async function PortfoliosPage() {
  // New This Month: Letzte 30 Tage
  const { data: newPortfolios, error: newError } = await supabase
    .from("portfolios")
    .select("*")
    .gte("created_at", new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString())
    .order("upvotes", { ascending: false });

  // All Time Ranking
  const { data: allTimePortfolios, error: allError } = await supabase
    .from("portfolios")
    .select("*")
    .order("upvotes", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">New This Month</h1>
      {newError ? (
        <p>Fehler: {newError.message}</p>
      ) : (
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {newPortfolios?.map((p) => (
    <div key={p.id} className="border p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-semibold text-gray-800">{p.title}</h2>
      <p className="text-gray-600 mt-2">{p.description}</p>
      <p className="mt-2 text-blue-500">{p.upvotes} Upvotes</p>
      <a href={`/portfolios/${p.id}`} className="mt-4 inline-block text-blue-600 hover:underline">
        Details ansehen
      </a>
    </div>
  ))}
</div>
      )}

      <h1 className="text-3xl font-bold mt-8 mb-4">All Time Ranking</h1>
      {allError ? (
        <p>Fehler: {allError.message}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {newPortfolios?.map((p) => (
    <div key={p.id} className="border p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-semibold text-gray-800">{p.title}</h2>
      <p className="text-gray-600 mt-2">{p.description}</p>
      <p className="mt-2 text-blue-500">{p.upvotes} Upvotes</p>
      <a href={`/portfolios/${p.id}`} className="mt-4 inline-block text-blue-600 hover:underline">
        Details ansehen
      </a>
    </div>
  ))}
</div>
      )}
    </div>
  );
}