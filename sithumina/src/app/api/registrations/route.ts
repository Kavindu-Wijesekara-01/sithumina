import { NextResponse } from "next/server";
import {
  getAllStoredRegistrations,
  addRegistrationInStore,
  updateRegistrationStatusInStore,
} from "@/lib/server-store";

export async function GET() {
  const registrations = getAllStoredRegistrations();
  return NextResponse.json({ success: true, registrations });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ownerName, phone, vehicleNumber, vehicleType, capacity, province } = body;

    if (!ownerName || !phone || !vehicleNumber) {
      return NextResponse.json(
        { success: false, error: "Owner name, phone, and vehicle number are required." },
        { status: 400 }
      );
    }

    const registration = addRegistrationInStore({
      ownerName,
      phone,
      vehicleNumber,
      vehicleType: vehicleType || "Lorry",
      capacity: capacity || "Standard",
      province: province || "Western Province",
    });

    return NextResponse.json({ success: true, registration });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to submit vehicle registration";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Registration ID and status are required." },
        { status: 400 }
      );
    }

    const updated = updateRegistrationStatusInStore(id, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Registration not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, registration: updated });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update registration";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
