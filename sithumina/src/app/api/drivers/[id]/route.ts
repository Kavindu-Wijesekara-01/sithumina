import { NextResponse } from "next/server";
import { getAllStoredDrivers } from "@/lib/server-store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cleanId = (id || "").trim().toUpperCase();

  const drivers = getAllStoredDrivers();
  const driver = drivers.find(
    (d) =>
      d.driverId.toUpperCase() === cleanId ||
      d.plate.toUpperCase() === cleanId ||
      (d.phone && d.phone.replace(/\s+/g, "") === cleanId.replace(/\s+/g, ""))
  );

  if (!driver) {
    return NextResponse.json(
      { success: false, error: "Driver not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, driver });
}
