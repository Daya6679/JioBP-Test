import { NextResponse } from "next/server";
import Vehicle from "@/models/Vehicle";
import { connectDB } from "@/lib/mongodb";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Unwrapping params
    const { id } = await params;

    const updatedVehicle = await Vehicle.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedVehicle) {
      return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    }
    
    return NextResponse.json(updatedVehicle, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    
    // Unwrapping params
    const { id } = await params;
    
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return NextResponse.json({ message: "Vehicle not found" }, { status: 404 });
    }
    
    return NextResponse.json(vehicle, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching vehicle" }, { status: 500 });
  }
}