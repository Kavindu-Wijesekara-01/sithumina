"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  subscribeReviews,
  createReview,
  Review,
  ReviewInput,
} from "@/lib/db-services";

export default function ReviewsPage() {
  const { locale } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newReview, setNewReview] = useState({
    name: "",
    role: "",
    stars: 5,
    route: "",
    commentEn: "",
    commentSi: "",
  });

  useEffect(() => {
    const unsub = subscribeReviews((data) => {
      setReviews(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.commentEn.trim()) return;
    setSubmitting(true);
    try {
      const input: ReviewInput = {
        name: newReview.name,
        role: newReview.role || (locale === "en" ? "Verified Client" : "පාරිභෝගික"),
        stars: newReview.stars,
        route: newReview.route || (locale === "en" ? "Island-wide" : "දිවයින පුරා"),
        commentEn: newReview.commentEn,
        commentSi: newReview.commentSi || newReview.commentEn,
        date: "Just now",
      };
      await createReview(input);
      setShowAddModal(false);
      setNewReview({
        name: "",
        role: "",
        stars: 5,
        route: "",
        commentEn: "",
        commentSi: "",
      });
    } catch (err) {
      console.error("Failed to add review:", err);
      alert("Failed to submit review to database.");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + (r.stars || 5), 0) / reviews.length
        ).toFixed(1)
      : "5.0";

  return (
    <main className="p-4 lg:p-[24px_32px] flex flex-col gap-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--y3)] text-[#5B4300] text-xs font-bold w-fit border border-[var(--y2)]">
            <span>⭐</span>
            <span>
              {avgRating} / 5 Rating ({reviews.length} Verified Reviews)
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--ink)]">
            {locale === "en"
              ? "Customer Reviews & Experiences"
              : "පාරිභෝගික අදහස් සහ සමාලෝචන"}
          </h1>
          <p className="text-[var(--mut)] text-sm leading-relaxed">
            {locale === "en"
              ? "Authentic, live-synced feedback from businesses, cargo distributors, and vehicle owners across Sri Lanka."
              : "සිතුමිණ ප්‍රවාහන සේවාව සමඟ එක්වූ ව්‍යාපාරිකයන් සහ පාරිභෝගිකයන්ගේ සැබෑ අදහස්."}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex-none px-4 py-2.5 rounded-xl bg-[var(--y)] text-[#26231B] font-extrabold text-xs cursor-pointer hover:opacity-90 shadow-xs flex items-center gap-1.5 transition-all"
        >
          <span>✍️</span>
          <span>{locale === "en" ? "Write a Review" : "ඔබගේ අදහස ලියන්න"}</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-[var(--mut)] text-sm">
          Loading live reviews from Firebase...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--line)] shadow-xs flex flex-col justify-between gap-4 hover:border-[#FFC20E] transition-all"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex text-[#FFC20E] text-sm">
                    {"★".repeat(rev.stars || 5)}
                  </div>
                  <span className="text-[11px] text-[var(--mut)] font-medium">
                    {rev.date || "Recently"}
                  </span>
                </div>
                <p className="text-xs text-[var(--ink)] leading-relaxed italic">
                  &ldquo;{locale === "en" ? rev.commentEn : rev.commentSi || rev.commentEn}&rdquo;
                </p>
              </div>

              <div className="border-t border-[var(--line)] pt-3 flex flex-col">
                <strong className="text-xs text-[var(--ink)]">{rev.name}</strong>
                <span className="text-[11px] text-[var(--mut)]">{rev.role}</span>
                <span className="text-[10.5px] text-[#1E9E5A] font-semibold mt-0.5">
                  📍 {rev.route}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Write a Review */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--card)] w-full max-w-lg rounded-3xl p-6 sm:p-7 border border-[var(--line)] shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h2 className="text-lg font-extrabold text-[var(--ink)]">
                {locale === "en" ? "Submit Your Feedback" : "ඔබගේ සමාලෝචනය ඇතුළත් කරන්න"}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-[var(--bg)] text-[var(--mut)] hover:text-[var(--ink)] grid place-items-center text-sm font-bold border-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddReview} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--ink)]">
                  {locale === "en" ? "Rating" : "තරු ඇගයීම"}
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, stars: star })}
                      className="text-2xl cursor-pointer bg-transparent border-0 p-0 text-[#FFC20E] transition-transform hover:scale-110"
                    >
                      {star <= newReview.stars ? "★" : "☆"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[var(--ink)]">
                    {locale === "en" ? "Your Name" : "ඔබගේ නම"} *
                  </label>
                  <input
                    required
                    type="text"
                    value={newReview.name}
                    onChange={(e) =>
                      setNewReview({ ...newReview, name: e.target.value })
                    }
                    placeholder="e.g. Kasun Fernando"
                    className="p-2.5 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[#FFC20E]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[var(--ink)]">
                    {locale === "en" ? "Designation / Role" : "තනතුර / ව්‍යාපාරය"}
                  </label>
                  <input
                    type="text"
                    value={newReview.role}
                    onChange={(e) =>
                      setNewReview({ ...newReview, role: e.target.value })
                    }
                    placeholder="e.g. Store Owner"
                    className="p-2.5 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[#FFC20E]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--ink)]">
                  {locale === "en" ? "Transport Route" : "ප්‍රවාහන මාර්ගය"}
                </label>
                <input
                  type="text"
                  value={newReview.route}
                  onChange={(e) =>
                    setNewReview({ ...newReview, route: e.target.value })
                  }
                  placeholder="e.g. Colombo – Galle"
                  className="p-2.5 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[#FFC20E]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--ink)]">
                  {locale === "en" ? "Review (English)" : "අදහස (ඉංග්‍රීසි)"} *
                </label>
                <textarea
                  required
                  rows={2}
                  value={newReview.commentEn}
                  onChange={(e) =>
                    setNewReview({ ...newReview, commentEn: e.target.value })
                  }
                  placeholder="Share details of your experience..."
                  className="p-2.5 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[#FFC20E]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--ink)]">
                  {locale === "en" ? "Review (Sinhala - Optional)" : "අදහස (සිංහල)"}
                </label>
                <textarea
                  rows={2}
                  value={newReview.commentSi}
                  onChange={(e) =>
                    setNewReview({ ...newReview, commentSi: e.target.value })
                  }
                  placeholder="ඔබගේ අත්දැකීම සිංහලෙන් ලියන්න..."
                  className="p-2.5 text-xs rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] outline-none focus:border-[#FFC20E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[var(--bg)] text-[var(--ink)] text-xs font-bold border-0 cursor-pointer hover:bg-[var(--line)]"
                >
                  {locale === "en" ? "Cancel" : "අවලංගු කරන්න"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[var(--y)] text-[#26231B] text-xs font-extrabold border-0 cursor-pointer hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Saving to Database..." : locale === "en" ? "Submit Review" : "ඇතුළත් කරන්න"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
