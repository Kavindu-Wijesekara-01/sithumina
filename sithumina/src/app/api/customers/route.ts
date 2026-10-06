import { NextResponse } from "next/server";
import {
  getAllStoredCustomers,
  upsertCustomerInStore,
} from "@/lib/server-store";

export async function GET() {
  const customers = getAllStoredCustomers();
  return NextResponse.json({ success: true, customers });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, city } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required." },
        { status: 400 }
      );
    }

    const customer = upsertCustomerInStore({
      name: name || "Customer",
      phone,
      email,
      city,
    });

    return NextResponse.json({ success: true, customer });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save customer";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
