import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import QRRequest from "@/models/QRRequest";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import QRCode from "qrcode";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const qrData = await QRRequest.findById(id)
      .populate("driverId", "name image")
      .populate("vehicleId", "vehicleNumber");

    if (!qrData) {
      return NextResponse.json(
        { message: "QR request not found" },
        { status: 404 },
      );
    }

    // Clean Driver Image
    const driverImageBase64 =
      qrData.driverId?.image?.replace(/^data:image\/[a-z]+;base64,/, "");

    const uidString = [
      qrData.driverId?._id?.toString(),
      qrData.driverId?.name,
      qrData.vehicleId?._id?.toString(),
      qrData.vehicleId?.vehicleNumber,
      qrData.fuelType,
      qrData.qty?.toString(),
      qrData.amount?.toString(),
      qrData._id?.toString(),
    ].join("#");

    const payload = {
      data: [
        { static_start: "Biometrik@2024" },
        { uid: uidString },
        { image_base64: driverImageBase64 },
      ],
    };

    const apiUrl = process.env.SECURE_QR_API_URL;

    if (!apiUrl) {
      throw new Error(
        "SECURE_QR_API_URL is not defined in environment variables",
      );
    }

    const response = await fetch(
      apiUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const result = await response.json();

    if (!response.ok || result.status !== "success") {
      throw new Error(
        result.detail || result.message || "External Service Error",
      );
    }

    const secureString = result.secureQr; // Corrected key

    if (!secureString) {
      throw new Error(
        "Service returned success but 'secureQr' data is missing.",
      );
    }

    // --- OPTIMIZED QR GENERATION ---
    // We change errorCorrectionLevel to 'L' to fit more data
    const qrImageBase64 = await QRCode.toDataURL(secureString, {
      errorCorrectionLevel: "L", // Changed from H to L for maximum capacity
      margin: 2,
      width: 600, // Increased width for better scan-ability of dense codes
    });

    qrData.qrBase64 = qrImageBase64;
    await qrData.save();

    return NextResponse.json({
      message: "QR generated successfully",
      qrBase64: qrData.qrBase64,
    });
  } catch (error: any) {
    console.error("QR GEN ERROR:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
