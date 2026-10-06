import { NextResponse } from "next/server";
import {
  getAllStoredBookings,
  getBookingsByCustomerPhone,
  createBookingInStore,
  updateBookingStatusInStore,
} from "@/lib/server-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (phone) {
    const bookings = getBookingsByCustomerPhone(phone);
    return NextResponse.json({ success: true, bookings });
  }

  const bookings = getAllStoredBookings();
  return NextResponse.json({ success: true, bookings });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      pickupCity,
      deliveryCity,
      date,
      vehicleType,
      packageDetails,
    } = body;

    if (!customerName || !customerPhone || !pickupCity || !deliveryCity) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer name, phone, pickup, and delivery cities are required.",
        },
        { status: 400 }
      );
    }

    const booking = createBookingInStore({
      customerName,
      customerPhone,
      pickupCity,
      deliveryCity,
      date: date || new Date().toISOString().split("T")[0],
      vehicleType: vehicleType || "14ft Lorry",
      packageDetails,
    });

    return NextResponse.json({ success: true, booking });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create booking";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      status,
      assignedLorryId,
      assignedDriverName,
      assignedDriverPhone,
      assignedPlate,
    } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Booking ID and status are required." },
        { status: 400 }
      );
    }

    const updated = updateBookingStatusInStore(id, status, {
      assignedLorryId,
      assignedDriverName,
      assignedDriverPhone,
      assignedPlate,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update booking";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
