import { NextResponse } from "next/server";
import {
  getAllStoredInquiries,
  addInquiryInStore,
  updateInquiryStatusInStore,
} from "@/lib/server-store";

export async function GET() {
  const inquiries = getAllStoredInquiries();
  return NextResponse.json({ success: true, inquiries });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, subject, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json(
        { success: false, error: "Name, phone, and message are required." },
        { status: 400 }
      );
    }

    const inquiry = addInquiryInStore({
      name,
      phone,
      email,
      subject: subject || "General Inquiry",
      message,
    });

    return NextResponse.json({ success: true, inquiry });
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error ? error.message : "Failed to submit inquiry";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Inquiry ID and status are required." },
        { status: 400 }
      );
    }

    const updated = updateInquiryStatusInStore(id, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Inquiry not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error ? error.message : "Failed to update inquiry";
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
