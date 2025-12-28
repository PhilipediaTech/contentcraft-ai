import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PLAN_CREDITS = {
  free: 10,
  pro: 500,
  enterprise: 9999,
};

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await request.json();

    if (!planId || !PLAN_CREDITS[planId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user's subscription tier and credits
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: planId,
        creditsRemaining: PLAN_CREDITS[planId],
      },
    });

    // Create a transaction record
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: planId === "free" ? 0 : planId === "pro" ? 19 : 99,
        description: `Upgraded to ${planId} plan`,
        status: "completed",
        creditsAdded: PLAN_CREDITS[planId],
      },
    });

    return NextResponse.json({
      success: true,
      subscriptionTier: updatedUser.subscriptionTier,
      creditsRemaining: updatedUser.creditsRemaining,
      message: `Successfully upgraded to ${planId} plan`,
    });
  } catch (error) {
    console.error("Upgrade plan error:", error);
    return NextResponse.json(
      { error: "Failed to upgrade plan" },
      { status: 500 }
    );
  }
}
