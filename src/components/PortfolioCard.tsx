"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Portfolio } from "../types";
import { User } from "@supabase/supabase-js";

interface PortfolioCardProps {
  portfolio: Portfolio;
  user: User | null;
  onUpvote: (id: string) => void;
  rank?: number;
}

export default function PortfolioCard({ portfolio, user, onUpvote, rank }: PortfolioCardProps) {
  const router = useRouter();

  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (user) {
      onUpvote(portfolio.id);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="w-full h-auto p-3 bg-white rounded-lg hover:bg-gray-100">
      <Link href={`/portfolios/${portfolio.id}`} className="block w-full rounded-lg">
        <div className="w-full bg-[#fafafa] rounded-lg aspect-[350/222]"></div>
      </Link>
      <div className="w-full h-[68px] mt-1 flex items-center gap-3">
        <span className="text-5xl font-inter font-semibold text-black">{rank || 2}</span>
        <div className="flex-1 flex flex-col">
          <h2 className="text-base font-inter font-medium text-black">{portfolio.title}</h2>
          <div className="flex flex-row text-sm font-inter font-normal text-[#A1A1A1]">
            <span>UI</span>
            <span>・</span>
            <span>Branding</span>
            <span>・</span>
            <span>Consulting</span>
          </div>
        </div>
        <button
          onClick={handleUpvoteClick}
          className="w-11 h-11 bg-white border-2 border-[#000000] rounded-md flex flex-col items-center justify-center gap-0 hover:border-blue-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 text-black"
            fill="currentColor"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2l-10 10h20z" />
          </svg>
          <span className="text-xs font-inter font-semibold text-black">{portfolio.upvotes}</span>
        </button>
      </div>
    </div>
  );
}