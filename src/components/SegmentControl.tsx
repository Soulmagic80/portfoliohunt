"use client";
import React from "react";
import Image from "next/image";

interface SegmentControlProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export default function SegmentControl({ activeFilter, setActiveFilter }: SegmentControlProps) {
  return (
    <div className="flex justify-center mb-10">
      <div className="inline-flex h-10 w-[360px] items-baseline justify-start rounded-lg bg-[#F5F2F0] p-[3px]">
        <button
          type="button"
          onClick={() => setActiveFilter("new")}
          className={`group inline-flex items-center justify-center whitespace-nowrap py-2 font-snormal transition-all duration-300 ease-in-out min-w-[32px] text-xs h-full w-1/2 px-3 ${
            activeFilter === "new"
              ? "rounded-md bg-white text-slate-950"
              : "bg-transparent text-slate-600 hover:text-blue-950"
          }`}
        >
        <Image src="/calendar.svg" alt="Calendar" width={16} height={16} className="mr-2" />
        New This Month
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={`group inline-flex items-center justify-center whitespace-nowrap py-2 font-normal transition-all duration-300 ease-in-out min-w-[32px] text-xs h-full w-1/2 px-3 ${
            activeFilter === "all"
              ? "rounded-md bg-white text-slate-950"
              : "bg-transparent text-slate-600 hover:text-blue-950"
          }`}
        >
          <Image src="/trophy.svg" alt="Trophy" width={16} height={16} className="mr-2" />
          All Time
        </button>
      </div>
    </div>
  );
}