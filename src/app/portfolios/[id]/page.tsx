import { supabase } from "../../../lib/supabase";
import FeedbackForm from "../../../components/FeedbackForm";
import Image from "next/image";

export default async function PortfolioPage({ params }: { params: { id: string } }) {
  const { data: portfolio, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !portfolio) {
    return <div>Portfolio nicht gefunden!</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">{portfolio.title}</h1>
      <p className="mb-4">{portfolio.description}</p>
      {portfolio.image_url && (
        <Image
          src={portfolio.image_url}
          alt={portfolio.title}
          width={800}
          height={256}
          className="w-full h-64 object-cover mb-4"
        />
      )}
      <p>{portfolio.upvotes} Upvotes</p>
      <FeedbackForm portfolioId={portfolio.id} />
    </div>
  );
}