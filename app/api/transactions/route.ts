// api/transaction/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import QRRequest from "@/models/QRRequest";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { driverId, vehicleId, qrId, qty, amount } = body;

    // Validation: QR is no longer required, but driver/vehicle and one value are.
    if (!driverId || !vehicleId || !qrId || (!qty && !amount)) {
      return NextResponse.json(
        {
          message:
            "Missing required data: Driver, Vehicle, and Qty/Amount are needed.",
        },
        { status: 400 },
      );
    }

    // 2. CHECK IF QR IS ALREADY USED
    const qrRecord = await QRRequest.findById(qrId);
    if (!qrRecord) {
      return NextResponse.json({ message: "Invalid QR Code" }, { status: 404 });
    }
    if (qrRecord.isUsed) {
      return NextResponse.json(
        { message: "This QR Code has already been used" },
        { status: 400 },
      );
    }

    const newTransaction = await Transaction.create({
      driverId,
      vehicleId,
      qrId,
      qty: qty || 0,
      amount: amount || 0,
    });

    // 4. MARK THE QR AS USED (Prevent reuse)
    qrRecord.isUsed = true;
    await qrRecord.save();

    return NextResponse.json(
      {
        message: "Transaction recorded successfully",
        transactionId: newTransaction._id,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Transaction Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
