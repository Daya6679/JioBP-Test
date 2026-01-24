import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Driver from "@/models/Driver";
import Vehicle from "@/models/Vehicle";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectDB();

    const DriverModel = Driver; 
    const VehicleModel = Vehicle;
    
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

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