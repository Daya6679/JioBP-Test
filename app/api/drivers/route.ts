import { connectDB } from "@/lib/mongodb";
import Driver from "@/models/Driver";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // Log the body to your terminal to see if data is reaching the server
    console.log("Incoming Driver Data:", body);

    const driver = await Driver.create(body);
    return NextResponse.json(driver, { status: 201 });
  } catch (error: any) {
    console.error("DRIVER_SAVE_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    // Fetch all drivers. If none exist, drivers will be []
    const drivers = await Driver.find({}).sort({ createdAt: -1 });
    
    // Always return a JSON array
    return NextResponse.json(drivers || [], { status: 200 });
  } catch (error: any) {
    console.error("GET_DRIVERS_ERROR:", error.message);
    return NextResponse.json([], { status: 500 });
  }
}