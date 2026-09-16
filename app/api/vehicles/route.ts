import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb'; // Ensure you have a db connection utility
import Vehicle from '@/models/Vehicle';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import type { SessionUser } from '@/lib/auth';

// GET: Fetch all vehicles
export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    console.log('Current Session:', session);

    if (!session || !(session.user as SessionUser)?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const vehicles = await Vehicle.find({
      userId: (session.user as SessionUser).id,
    }).sort({ createdAt: -1 });
    return NextResponse.json(vehicles, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST: Create a new vehicle
export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session || !(session.user as SessionUser)?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as SessionUser).id;

    const body = await req.json();

    // Basic validation
    if (!body.vehicleNumber || !body.make || !body.model) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newVehicle = await Vehicle.create({
      ...body,
      userId,
    });
    return NextResponse.json(newVehicle, { status: 201 });
  } catch (error: unknown) {
    // Handle duplicate vehicle number error
    const err = error as { code?: number; message?: string };
    if (err.code === 11000) {
      return NextResponse.json({ message: 'Vehicle Number already exists' }, { status: 400 });
    }
    return NextResponse.json({ message: err.message ?? 'Internal server error' }, { status: 500 });
  }
}
