import { connectDB } from "@/lib/mongodb";
import Driver from "@/models/Driver";
import { NextResponse } from "next/server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    // const userId = session?.user?.id;
    const body = await req.json();

    // Log the body to your terminal to see if data is reaching the server
    console.log("Incoming Driver Data:", body);

    const driver = await Driver.create({
      ...body,
      userId,
    });
    return NextResponse.json(driver, { status: 201 });
  } catch (error: any) {
    console.error("DRIVER_SAVE_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    console.log("Current Session:", session);

    if (!session || (session.user as any)?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Fetch all drivers. If none exist, drivers will be []
    const drivers = await Driver.find({
      userId: (session.user as any).id,
    }).sort({ createdAt: -1 });

    // Always return a JSON array
    return NextResponse.json(drivers || [], { status: 200 });
  } catch (error: any) {
    console.error("GET_DRIVERS_ERROR:", error.message);
    return NextResponse.json([], { status: 500 });
  }
}
