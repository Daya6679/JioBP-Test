import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Driver from "@/models/Driver";
import Vehicle from "@/models/Vehicle";

export async function GET(req: Request) {
  try {
    await connectDB();

    const DriverModel = Driver;
    const VehicleModel = Vehicle;

    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get("driverId");
    const vehicleId = searchParams.get("vehicleId");

    const query: any = {};
    if (driverId) query.driverId = driverId;
    if (vehicleId) query.vehicleId = vehicleId;

    // The .populate() method replaces IDs with actual document data
    const transactions = await Transaction.find(query)
      .populate("driverId", "name")
      .populate("vehicleId", "vehicleNumber")
      .sort({ createdAt: -1 });

    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
