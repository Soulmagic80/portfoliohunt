import Link from "next/link";
import { useRouter } from "next/navigation";
import { Portfolio } from "../types";
import { User } from "@supabase/supabase-js";

interface PortfolioCardProps {
  portfolio: Portfolio;
  user: User | null;
  onUpvote: (id: string) => void;
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
    <div className="w-full h-auto p-2 rounded-lg bg-white border border-[#e8e8e8]">
      {/* Zwei Bereiche nebeneinander, untereinander bei <672px */}
      <div className="flex flex-row flex-wrap gap-2">
        {/* Linker Bereich */}
        <div className="w-full min-w-[340px] flex-1 min-w-[324px] min-h-[240px] bg-[#f3f3f3] p-2 rounded-sm">
          {/* Platzhalter für später (z. B. Bild) */}
        </div>

        {/* Rechter Bereich */}
        <div className="w-full min-w-[340px] flex-1 min-w-[324px] min-h-[240px] bg-white p-4 flex flex-col justify-between text-left">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{portfolio.title}</h2>
            <p className="text-sm text-gray-600 mt-2">{portfolio.description}</p>
            <Link href={`/portfolios/${portfolio.id}`} className="text-sm text-blue-600 hover:underline block mt-2">
              Details
            </Link>
            {/* Tags untereinander */}
            <div className="mt-2 flex flex-col gap-1">
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full w-fit">UI</span>
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full w-fit">UX</span>
            </div>
          </div>
          <div className="flex justify-end items-end">
            <button
              onClick={handleUpvoteClick}
              className="w-12 h-12 bg-white border border-[#878787] rounded-md flex flex-col items-center justify-center hover:bg-gray-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-sm text-gray-700">{portfolio.upvotes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}