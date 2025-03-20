"use client";
import { supabase } from "../../../lib/supabase";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Portfolio } from "../../../types";

interface Feedback {
  id: string;
  portfolio_id: string;
  user_id: string;
  positive_feedback: string[];
  negative_feedback: string[];
  comment: string | null;
  created_at: string;
}

export default function PortfolioDetail() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [positiveFeedback, setPositiveFeedback] = useState<string[]>([]); // Jetzt ein Array
  const [negativeFeedback, setNegativeFeedback] = useState<string[]>([]); // Jetzt ein Array
  const [comment, setComment] = useState("");
  const [positiveOptions, setPositiveOptions] = useState<string[]>([]);
  const [negativeOptions, setNegativeOptions] = useState<string[]>([]);
  const router = useRouter();
  const { id } = useParams();

  const fetchPortfolio = useCallback(async () => {
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
  }, [id]);

  const fetchFeedbackOptions = useCallback(async () => {
    const { data: positiveData, error: positiveError } = await supabase
      .from("positive_feedback_options")
      .select("option_text");
    if (!positiveError) setPositiveOptions(positiveData.map((d) => d.option_text));

    const { data: negativeData, error: negativeError } = await supabase
      .from("negative_feedback_options")
      .select("option_text");
    if (!negativeError) setNegativeOptions(negativeData.map((d) => d.option_text));
  }, []);

  useEffect(() => {
    fetchPortfolio();
    fetchFeedbackOptions();
  }, [id, fetchPortfolio, fetchFeedbackOptions]);

  const handlePositiveChange = (option: string) => {
    setPositiveFeedback((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const handleNegativeChange = (option: string) => {
    setNegativeFeedback((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push("/login");
      return;
    }

    const feedbackData = {
      portfolio_id: id,
      user_id: userData.user.id,
      positive_feedback: positiveFeedback, // Array direkt übernehmen
      negative_feedback: negativeFeedback, // Array direkt übernehmen
      ...(comment.trim() && { comment }),
    };

    const { error } = await supabase.from("feedback").insert(feedbackData);

    if (!error) {
      setFeedbacks((prev) => [
        ...prev,
        {
          portfolio_id: id as string,
          user_id: userData.user.id,
          positive_feedback: positiveFeedback,
          negative_feedback: negativeFeedback,
          comment: comment.trim() || null,
          id: "",
          created_at: new Date().toISOString(),
        },
      ]);
      setPositiveFeedback([]);
      setNegativeFeedback([]);
      setComment("");
      fetchPortfolio();
    } else {
      console.error("Submit feedback failed:", error.message);
    }
  };

  const imageSrc = portfolio?.image
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-images/${portfolio.image}`
    : null;

  const countFeedback = (type: "positive" | "negative") => {
    const feedbackMap = new Map<string, number>();
    feedbacks.forEach((f) => {
      const items = type === "positive" ? f.positive_feedback : f.negative_feedback;
      items?.forEach((item: string) => {
        feedbackMap.set(item, (feedbackMap.get(item) || 0) + 1);
      });
    });
    const sortedFeedback = Array.from(feedbackMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([item]) => item);
    return Array(3)
      .fill("na")
      .map((defaultValue, index) => sortedFeedback[index] || defaultValue)
      .map((item, index) => `${index + 1}. ${item}`);
  };

  const topPositive = countFeedback("positive");
  const topNegative = countFeedback("negative");

  const rank = portfolio?.rank_all_time || portfolio?.rank_new || "-";
  const isSubmitDisabled = positiveFeedback.length === 0 || negativeFeedback.length === 0; // Mindestens eine Auswahl pro Kategorie

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
          <ul className="list-none pl-0 mb-4">
            {topPositive.map((item, index) => (
              <li key={index} className="text-base font-inter text-gray-700">{item}</li>
            ))}
          </ul>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Positive Feedback <span className="text-red-500">*</span>
            </label>
            <div className="mt-1.5 max-h-40 overflow-y-auto border rounded-lg p-2">
              {positiveOptions.map((option) => (
                <div key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`positive-${option}`}
                    checked={positiveFeedback.includes(option)}
                    onChange={() => handlePositiveChange(option)}
                    className="mr-2"
                  />
                  <label htmlFor={`positive-${option}`} className="text-sm text-gray-700">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="md:w-1/2">
          <h2 className="text-xl font-inter font-semibold text-gray-900 mb-2">What could be better:</h2>
          <ul className="list-none pl-0 mb-4">
            {topNegative.map((item, index) => (
              <li key={index} className="text-base font-inter text-gray-700">{item}</li>
            ))}
          </ul>
          <div>
            <label className="block text-sm font-medium text-gray-900">
              Negative Feedback <span className="text-red-500">*</span>
            </label>
            <div className="mt-1.5 max-h-40 overflow-y-auto border rounded-lg p-2">
              {negativeOptions.map((option) => (
                <div key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`negative-${option}`}
                    checked={negativeFeedback.includes(option)}
                    onChange={() => handleNegativeChange(option)}
                    className="mr-2"
                  />
                  <label htmlFor={`negative-${option}`} className="text-sm text-gray-700">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
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
            placeholder="Add your comment here (optional)..."
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded text-white ${
              isSubmitDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={isSubmitDisabled}
          >
            Submit
          </button>
        </form>
        <div className="mt-6">
          <h3 className="text-lg font-inter font-semibold text-gray-900 mb-2">Comments</h3>
          {feedbacks.filter((f) => (f.comment || "").trim()).length > 0 ? (
            feedbacks
              .filter((f) => (f.comment || "").trim())
              .map((f, index) => (
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