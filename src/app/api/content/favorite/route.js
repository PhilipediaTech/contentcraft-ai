import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contentId, isFavorite } = await request.json();

    if (!contentId) {
      return NextResponse.json(
        { error: "Content ID required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update favorite status
    const updated = await prisma.content.updateMany({
      where: {
        id: contentId,
        userId: user.id,
      },
      data: {
        isFavorite: isFavorite,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: "Content not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Favorite status updated",
      isFavorite,
    });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return NextResponse.json(
      { error: "Failed to update favorite status" },
      { status: 500 }
    );
  }
}
