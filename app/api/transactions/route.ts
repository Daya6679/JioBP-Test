import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import QRRequest from "@/models/QRRequest";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();
    
    // 1. Identify the manager/user making the transaction
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { driverId, vehicleId, qrId, qty, amount } = body;

    // 2. Validation
    if (!driverId || !vehicleId || !qrId || !qty || !amount) {
      return NextResponse.json({ message: "Missing required transaction data" }, { status: 400 });
    }

    // 3. Check if QR is already used
    const qrRecord = await QRRequest.findById(qrId);
    if (!qrRecord) {
      return NextResponse.json({ message: "Invalid QR Code" }, { status: 404 });
    }
    if (qrRecord.isUsed) {
      return NextResponse.json({ message: "This QR Code has already been used" }, { status: 400 });
    }

    // 4. Create the Transaction Record
    const newTransaction = await Transaction.create({
      driverId,
      vehicleId,
      qrId,
      qty,
      amount,
      userId: session.user.id, // Linking to the manager who scanned it
    });

    // 5. Mark the QR as used (Soft Delete from active list)
    qrRecord.isUsed = true;
    await qrRecord.save();

    return NextResponse.json({
      message: "Transaction recorded successfully",
      transactionId: newTransaction._id
    }, { status: 201 });

  } catch (error: any) {
    console.error("Transaction Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}