import { NextResponse } from "next/server";
import { updateLorryGpsInStore } from "@/lib/server-store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { lat, lng, heading = 0, speedKmH = 0 } = body;

    if (lat === undefined || lng === undefined) {
      return NextResponse.json(
        { success: false, error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const updated = updateLorryGpsInStore(
      id,
      Number(lat),
      Number(lng),
      Number(heading) || 0,
      Number(speedKmH) || 0
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Lorry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, lorry: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update location";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
