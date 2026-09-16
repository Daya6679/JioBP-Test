import { connectDB } from '@/lib/mongodb';
import Driver from '@/models/Driver';
import { NextResponse } from 'next/server';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    // 🔥 Await the params to get the ID
    const { id } = await params;
    const body = await req.json();

    if (body.licenseNumber) {
      const duplicate = await Driver.findOne({
        licenseNumber: body.licenseNumber,
        _id: { $ne: id }, // "Not Equal" to the current driver being edited
      });

      if (duplicate) {
        return NextResponse.json(
          {
            message: 'This license number is already assigned to another driver.',
          },
          { status: 400 },
        );
      }
    }

    const updatedDriver = await Driver.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updatedDriver) {
      return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json(updatedDriver, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('UPDATE_ERROR:', message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
