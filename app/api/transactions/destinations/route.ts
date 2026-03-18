import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/transactions/destinations
 * List available admin destinations for student submissions.
 */
export async function GET() {
  try {
    await requireAuth("STUDENT");

    const destinations = await prisma.user.findMany({
      where: { 
        role: "ADMIN",
        isOpen: true // Only show open destinations
      },
      select: {
        id: true,
        name: true,
        destinationName: true,
        categoryCode: true,
        acceptedDocuments: true,
      },
    });

    return NextResponse.json(destinations);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
