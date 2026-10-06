import { NextResponse } from "next/server";
import {
  getAllStoredDrivers,
  registerDriverInStore,
} from "@/lib/server-store";

export async function GET() {
  const drivers = getAllStoredDrivers();
  return NextResponse.json({ success: true, drivers });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, plate, vehicleNumber, vehicleType, route, driverId } = body;
    const finalPlate = plate || vehicleNumber;

    if (!name || !phone || !finalPlate) {
      return NextResponse.json(
        { success: false, error: "Name, phone, and plate are required." },
        { status: 400 }
      );
    }

    const result = registerDriverInStore({
      name,
      phone,
      plate: finalPlate,
      vehicleType: vehicleType || "14ft Closed",
      route: route || "Colombo – Island-wide",
      driverId,
    });

    return NextResponse.json({
      success: true,
      driver: result.driver,
      lorry: result.lorry,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to register driver.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
