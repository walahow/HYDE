import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

// GET /api/destinations
// Returns all admin users as "destinations" for the student dashboard
export async function GET() {
  try {
    const destinations = await prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: {
        id: true,
        name: true,
        destinationName: true,
        categoryCode: true,
        acceptedDocuments: true,
        isOpen: true,
      },
    });

    return NextResponse.json(destinations);
  } catch (error: any) {
    console.error("[DESTINATIONS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message }, 
      { status: 500 }
    );
  }
}
