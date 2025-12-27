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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Reset credits to the user's tier default
    const creditsByTier = {
      free: 10,
      pro: 500,
      enterprise: 9999,
    };

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        creditsRemaining: creditsByTier[user.subscriptionTier] || 10,
      },
    });

    return NextResponse.json({
      message: "Credits reset successfully",
      creditsRemaining: updatedUser.creditsRemaining,
    });
  } catch (error) {
    console.error("Credit reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset credits" },
      { status: 500 }
    );
  }
}
