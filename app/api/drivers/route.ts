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

    const existingDriver = await Driver.findOne({ 
      licenseNumber: body.licenseNumber,
      // Optional: If multiple users can have the same driver, 
      // remove the userId check below to make it globally unique.
      userId: (session.user as any).id 
    });

    if (existingDriver) {
      return NextResponse.json(
        { message: "A driver with this license number already exists in your records." },
        { status: 400 }
      );
    }

    // Log the body to your terminal to see if data is reaching the server
    console.log("Incoming Driver Data:", body);

    const driver = await Driver.create({
      ...body,
      userId,
    });
    return NextResponse.json(driver, { status: 201 });
  } catch (error: any) {
    console.error("DRIVER_SAVE_ERROR:", error.message);
    if (error.code === 11000) {
      return NextResponse.json(
        {
          message:
            "A driver with this license number already exists. Please check and try again.",
        },
        { status: 400 }, // Bad Request
      );
    }

    if (error.name === "ValidationError") {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    console.log("Current Session:", session);

    if (!session || !(session.user as any)?.id) {
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
