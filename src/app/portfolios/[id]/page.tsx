"use client";
import { supabase } from "../../../lib/supabase";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Portfolio } from "../../../types"; // Typ aus types importieren

interface Feedback {
  id: string;
  portfolio_id: string;
  user_id: string;
  positive_feedback: string[];
  negative_feedback: string[];
  comment: string;
  created_at: string;
}

export default function PortfolioDetail() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [positiveFeedback, setPositiveFeedback] = useState<string[]>([]);
  const [negativeFeedback, setNegativeFeedback] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const router = useRouter();
  const { id } = useParams();

  const positiveOptions = [
    "Clean layout",
    "Good UX",
    "Strong Typography",
    "Great Colors",
    "Innovative Design",
    "User-Friendly",
  ];
  const negativeOptions = [
    "Needs more contrast",
    "Cluttered layout",
    "Weak typography",
    "Color mismatch",
    "Confusing navigation",
    "Lacks originality",
  ];

  useEffect(() => {
    fetchPortfolio();
  }, [id, fetchPortfolio]);

  const fetchPortfolio = async () => {
    const { data: portfolioData, error: portfolioError } = await supabase
      .from("portfolios")
      .select("*")
      .eq("id", id)
      .single();

    if (portfolioError) {
      console.error("Fetch portfolio failed:", portfolioError.message);
      return;
    }
    setPortfolio(portfolioData);

    const { data: feedbackData, error: feedbackError } = await supabase
      .from("feedback")
      .select("*")
      .eq("portfolio_id", id);

    if (!feedbackError) setFeedbacks(feedbackData || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("feedback").insert({
      portfolio_id: id,
      user_id: userData.user.id,
      positive_feedback: positiveFeedback,
      negative_feedback: negativeFeedback,
      comment,
    });

    if (!error) {
      setFeedbacks((prev) => [
        ...prev,
        { portfolio_id: id as string, user_id: userData.user.id, positive_feedback: positiveFeedback, negative_feedback: negativeFeedback, comment, id: "", created_at: new Date().toISOString() },
      ]);
      setPositiveFeedback([]);
      setNegativeFeedback([]);
      setComment("");
      fetchPortfolio(); // Refresh nach Feedback
    } else {
      console.error("Submit feedback failed:", error.message);
    }
  };

  // Bild-URL aus Storage oder Fallback
  const imageSrc = portfolio?.image
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-images/${portfolio.image}`
    : null;

  // Top 3 Feedbacks berechnen
  const countFeedback = (type: "positive" | "negative") => {
    const feedbackMap = new Map<string, number>();
    feedbacks.forEach((f) => {
      const items = type === "positive" ? f.positive_feedback : f.negative_feedback;
      items?.forEach((item: string) => {
        feedbackMap.set(item, (feedbackMap.get(item) || 0) + 1);
      });
    });
    return Array.from(feedbackMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([item]) => item);
  };

  const topPositive = countFeedback("positive");
  const topNegative = countFeedback("negative");

  // Rang aus DB holen (primär rank_all_time, Fallback rank_new)
  const rank = portfolio?.rank_all_time || portfolio?.rank_new || "-";

  return (
    <div className="w-full max-w-[1280px] mx-auto p-6">
      {/* DIV 1: Bild + Upvote/Titel */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-1/2">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={portfolio?.title || "Portfolio"}
              width={640}
              height={400}
              className="w-full rounded-lg object-cover"
            />
          ) : (
            <div className="w-full bg-[#fafafa] rounded-lg aspect-[350/222]"></div>
          )}
        </div>
        <div className="md:w-1/2 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="text-5xl font-inter font-semibold text-black">{rank}</span>
            <div className="w-11 h-11 bg-white border-2 border-[#000000] rounded-md flex flex-col items-center justify-center gap-0">
              <Image src="/upvote.svg" alt="Upvote" width={12} height={12} />
              <span className="text-xs font-inter font-semibold text-black">{portfolio?.upvotes || 0}</span>
            </div>
          </div>
          <h1 className="text-3xl font-inter font-bold text-gray-900">{portfolio?.title}</h1>
          <p className="text-lg font-inter text-gray-600">{portfolio?.description}</p>
        </div>
      </div>

      {/* DIV 2: Feedback Top 3 */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-1/2">
          <h2 className="text-xl font-inter font-semibold text-gray-900 mb-2">What users love:</h2>
          <ul className="list-disc pl-5 mb-4">
            {topPositive.length > 0 ? (
              topPositive.map((item, index) => (
                <li key={index} className="text-base font-inter text-gray-700">{item}</li>
              ))
            ) : (
              <>
                <li className="text-base font-inter text-gray-700">1. Clean layout</li>
                <li className="text-base font-inter text-gray-700">2. Good UX</li>
                <li className="text-base font-inter text-gray-700">3. Strong Typography</li>
              </>
            )}
          </ul>
          <select
            multiple
            value={positiveFeedback}
            onChange={(e) => setPositiveFeedback(Array.from(e.target.selectedOptions, (option) => option.value))}
            className="w-full p-2 border rounded"
          >
            {positiveOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="md:w-1/2">
          <h2 className="text-xl font-inter font-semibold text-gray-900 mb-2">What could be better:</h2>
          <ul className="list-disc pl-5 mb-4">
            {topNegative.length > 0 ? (
              topNegative.map((item, index) => (
                <li key={index} className="text-base font-inter text-gray-700">{item}</li>
              ))
            ) : (
              <>
                <li className="text-base font-inter text-gray-700">1. Needs more contrast</li>
                <li className="text-base font-inter text-gray-700">2. Cluttered layout</li>
                <li className="text-base font-inter text-gray-700">3. Weak typography</li>
              </>
            )}
          </ul>
          <select
            multiple
            value={negativeFeedback}
            onChange={(e) => setNegativeFeedback(Array.from(e.target.selectedOptions, (option) => option.value))}
            className="w-full p-2 border rounded"
          >
            {negativeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DIV 3: Kommentarfeld + Kommentare */}
      <div className="mb-8">
        <h2 className="text-xl font-inter font-semibold text-gray-900 mb-2">Your Feedback</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-2 border rounded h-32"
            placeholder="Add your comment here..."
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Submit
          </button>
        </form>
        <div className="mt-6">
          <h3 className="text-lg font-inter font-semibold text-gray-900 mb-2">Comments</h3>
          {feedbacks.length > 0 ? (
            feedbacks.map((f, index) => (
              <div key={index} className="p-4 bg-gray-100 rounded-lg mb-2">
                <p className="text-base font-inter text-gray-700">{f.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}