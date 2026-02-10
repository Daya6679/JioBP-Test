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
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const qrData = await QRRequest.findById(id)
      .populate("driverId", "name image") 
      .populate("vehicleId", "vehicleNumber");

    if (!qrData) {
      return NextResponse.json({ message: "QR request not found" }, { status: 404 });
    }

    const rawImage = qrData.driverId?.image;
    if (!rawImage) {
      return NextResponse.json({ message: "Driver image is missing. Please update driver profile." }, { status: 400 });
    }

    const driverImageBase64 = rawImage.includes("base64,") 
      ? rawImage.split("base64,")[1] 
      : rawImage;

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
    const apiKey = process.env.SECURE_QR_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error("API URL or API Key is missing in environment variables");
    }

    // --- GRACEFUL ERROR HANDLING & FETCH ---
    console.log("📡 Contacting Secure QR API with x-api-key...");
    
    let response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      response = await fetch(apiUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": apiKey // NEW HEADER ADDED HERE
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchErr: any) {
      console.error("❌ API Connection Error:", fetchErr.message);
      return NextResponse.json(
        { message: "API is down, QR not generated. Please check connection." }, 
        { status: 503 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ External API Error Status:", response.status, errorText);
      return NextResponse.json(
        { message: "Authentication failed or API error. QR not generated." }, 
        { status: response.status }
      );
    }

    const result = await response.json();

    if (result.status !== "success" || !result.secureQr) {
      throw new Error(result.message || "Invalid response format from External API");
    }

    // --- GENERATE QR ---
    const qrImageBase64 = await QRCode.toDataURL(result.secureQr, {
      errorCorrectionLevel: "L", 
      margin: 2,
      width: 600,
    });

    const cleanQRBase64 = qrImageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
    qrData.qrBase64 = cleanQRBase64;
    await qrData.save();

    return NextResponse.json({
      message: "QR generated successfully",
      qrBase64: cleanQRBase64,
    });

  } catch (error: any) {
    console.error("🚨 GENERAL ERROR:", error.message);
    return NextResponse.json({ message: error.message || "An unexpected error occurred." }, { status: 500 });
  }
}