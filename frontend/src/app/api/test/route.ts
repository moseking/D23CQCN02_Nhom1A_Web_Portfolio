import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Database connection failed";
}

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      message: "Database connected successfully",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: getErrorMessage(error),
    });
  }
}
