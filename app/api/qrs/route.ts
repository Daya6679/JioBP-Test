import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import QRRequest from "@/models/QRRequest";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET: Fetch user-specific QR requests
export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const qrs = await QRRequest.find({ userId: session.user.id })
      .populate("driverId", "name") // Fetch only the name field from Driver
      .populate("vehicleId", "vehicleNumber") // Fetch only vehicleNumber from Vehicle
      .sort({ createdAt: -1 });
    return NextResponse.json(qrs, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST: Create a new QR Request
export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Create record with hidden userId from session
    const newQrRequest = await QRRequest.create({
      ...body,
      userId: session.user.id,
    });

    return NextResponse.json(newQrRequest, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
