import { supabase } from "../lib/supabase";

export default async function Home() {
  const { data, error } = await supabase.from("portfolios").select("*");
  return (
    <div className="bg-blue-500 text-white p-4">
      <h1 className="text-3xl font-bold">Test Tailwind & Supabase</h1>
      <p>{error ? "Fehler: " + error.message : "Daten: " + JSON.stringify(data)}</p>
    </div>
  );
}
