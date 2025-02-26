import Link from "next/link";
import { useRouter } from "next/navigation"; // Für Redirect
import { Portfolio } from "../types";

interface PortfolioCardProps {
  portfolio: Portfolio;
  user: any; // Später genauer typisieren
  onUpvote: (id: string) => void; // Callback für Upvote
}

export default function PortfolioCard({ portfolio, user, onUpvote }: PortfolioCardProps) {
  const router = useRouter();

  const handleUpvoteClick = () => {
    if (user) {
      onUpvote(portfolio.id); // Eingeloggt: Upvote
    } else {
      router.push("/login"); // Nicht eingeloggt: Redirect
    }
  };

  return (
    <div className="border p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-semibold text-gray-800">{portfolio.title}</h2>
      <p className="text-gray-600 mt-2">{portfolio.description}</p>
      <div className="mt-2 flex items-center gap-2">
        <p className="text-blue-500">{portfolio.upvotes} Upvotes</p>
        <button
          onClick={handleUpvoteClick}
          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
        >
          Upvote
        </button>
      </div>
      <Link href={`/portfolios/${portfolio.id}`} className="mt-2 text-blue-600 hover:underline">
        Details
      </Link>
    </div>
  );
}