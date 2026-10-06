import { NextResponse } from "next/server";
import { getAllStoredReviews, addReviewInStore } from "@/lib/server-store";

export async function GET() {
  const reviews = getAllStoredReviews();
  return NextResponse.json({ success: true, reviews });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, rating, comment, service } = body;

    if (!name || !comment) {
      return NextResponse.json(
        { success: false, error: "Name and comment are required." },
        { status: 400 }
      );
    }

    const review = addReviewInStore({
      name,
      rating: Number(rating) || 5,
      comment,
      service: service || "Island-wide Transport",
    });

    return NextResponse.json({ success: true, review });
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error ? error.message : "Failed to submit review";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
