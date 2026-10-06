import { NextResponse } from "next/server";
import { updateLorryStatusInStore } from "@/lib/server-store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (status !== "empty" && status !== "on_trip") {
      return NextResponse.json(
        { success: false, error: "Status must be 'empty' or 'on_trip'" },
        { status: 400 }
      );
    }

    const updated = updateLorryStatusInStore(id, status);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Lorry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, lorry: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update status";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
