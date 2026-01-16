import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb"; // Ensure you have a db connection utility
import Vehicle from "@/models/Vehicle";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET: Fetch all vehicles
export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    console.log("Current Session:", session);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const vehicles = await Vehicle.find({
      userId: session.user.id,
    }).sort({ createdAt: -1 });
    return NextResponse.json(vehicles, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST: Create a new vehicle
export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json();

    // Basic validation
    if (!body.vehicleNumber || !body.make || !body.model) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const newVehicle = await Vehicle.create({
      ...body,
      userId,
    });
    return NextResponse.json(newVehicle, { status: 201 });
  } catch (error: any) {
    // Handle duplicate vehicle number error
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Vehicle Number already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
