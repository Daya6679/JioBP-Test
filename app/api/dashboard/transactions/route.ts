import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get('driverId');
    const vehicleId = searchParams.get('vehicleId');

    const query: Record<string, string> = {};
    if (driverId) query.driverId = driverId;
    if (vehicleId) query.vehicleId = vehicleId;

    // The .populate() method replaces IDs with actual document data
    const transactions = await Transaction.find(query)
      .populate('driverId', 'name')
      .populate('vehicleId', 'vehicleNumber')
      .sort({ createdAt: -1 });

    return NextResponse.json(transactions);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
