// api/transaction/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import QRRequest from '@/models/QRRequest';

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { driverId, vehicleId, qrId, qty, amount, userId } = body;

    // Validation: QR is no longer required, but driver/vehicle and one value are.
    if (!userId || !driverId || !vehicleId || !qrId || (!qty && !amount)) {
      return NextResponse.json(
        {
          message: 'Missing required data: Driver, Vehicle, and Qty/Amount are needed.',
        },
        { status: 400 },
      );
    }

    // 2. CHECK IF QR IS ALREADY USED
    const qrRecord = await QRRequest.findById(qrId);
    if (!qrRecord) {
      return NextResponse.json({ message: 'Invalid QR Code' }, { status: 404 });
    }
    if (qrRecord.isUsed) {
      return NextResponse.json({ message: 'This QR Code has already been used' }, { status: 400 });
    }

    const newTransaction = await Transaction.create({
      driverId,
      vehicleId,
      qrId,
      qty: qty || 0,
      amount: amount || 0,
      userId,
    });

    // 4. MARK THE QR AS USED (Prevent reuse)
    qrRecord.isUsed = true;
    await qrRecord.save();

    return NextResponse.json(
      {
        message: 'Transaction recorded successfully',
        transactionId: newTransaction._id,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Transaction Error:', message);
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    // 2. If no userId is provided, return an error (prevents seeing all data)
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required to view transactions.' },
        { status: 400 },
      );
    }

    // 3. Query the database for transactions where userId matches
    // NOTE: Ensure your Mongoose Model has a 'userId' field
    const transactions = await Transaction.find({ userId: userId })
      .populate('driverId', 'name') // Only pull the 'name' field from Driver
      .populate('vehicleId', 'vehicleNumber')
      .sort({
        createdAt: -1,
      });

    return NextResponse.json(transactions, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
