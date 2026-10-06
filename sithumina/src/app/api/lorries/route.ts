import { NextResponse } from "next/server";
import {
  getAllStoredLorries,
  deleteLorryFromStore,
  registerDriverInStore,
} from "@/lib/server-store";

export async function GET() {
  const lorries = getAllStoredLorries();
  return NextResponse.json({ success: true, lorries });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plate, route, driverName, vehicleType } = body;

    if (!plate) {
      return NextResponse.json(
        { success: false, error: "Plate number is required" },
        { status: 400 }
      );
    }

    const { lorry, driver } = registerDriverInStore({
      plate,
      name: driverName || "Assigned Driver",
      phone: "077 123 4567",
      vehicleType: vehicleType || "14ft Lorry",
      route: route || "Colombo – Island-wide",
    });

    return NextResponse.json({ success: true, lorry, driver });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add lorry";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Lorry id required" },
        { status: 400 }
      );
    }
    const deleted = deleteLorryFromStore(id);
    return NextResponse.json({ success: true, deleted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete lorry";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
