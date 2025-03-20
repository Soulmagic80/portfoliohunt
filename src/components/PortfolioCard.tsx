"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

  // Bild-URL aus Storage oder Fallback
  const imageSrc = portfolio.image
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-images/${portfolio.image}`
    : portfolio.image_url || null;

  // Erste 3 Tags oder leer
  const displayTags = portfolio.tags?.slice(0, 3) || [];

  return (
    <div className="w-full h-auto p-3 bg-white rounded-lg hover:bg-[#fafafa]">
      <Link href={`/portfolios/${portfolio.id}`} className="block w-full rounded-lg">
        <div className="w-full rounded-lg aspect-[350/222] overflow-hidden">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={portfolio.title}
              width={350}
              height={222}
              className="object-cover w-full h-full rounded-lg" // Border-Radius 8px
            />
          ) : (
            <div className="w-full bg-[#F5F2F0] rounded-lg aspect-[350/222]"></div> // Platzhalter
          )}
        </div>
      </Link>
      <div className="w-full h-[68px] mt-1 flex items-center gap-3">
        <span className="text-5xl font-inter font-semibold text-black">{rank || 2}</span>
        <div className="flex-1 flex flex-col">
          <h2 className="text-base font-inter font-medium text-black">{portfolio.title}</h2>
          <div className="flex flex-row text-sm font-inter font-normal text-[#A1A1A1] gap-1">
            {displayTags.map((tag, index) => (
              <span key={index}>
                {tag}
                {index < displayTags.length - 1 && "・"}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={handleUpvoteClick}
          className="w-11 h-11 bg-white border-2 border-[#000000] rounded-md flex flex-col items-center justify-center gap-0 hover:border-blue-500"
        >
          <Image src="/upvote.svg" alt="Upvote" width={12} height={12} />
          <span className="text-xs font-inter font-semibold text-black">{portfolio.upvotes}</span>
        </button>
      </div>
    </div>
  );
}