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

    const { type, prompt, result } = await request.json();

    if (!type || !prompt || !result) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Save content with favorite flag
    const content = await prisma.content.create({
      data: {
        userId: user.id,
        type,
        prompt,
        result,
        creditsUsed: 0, // Already deducted during generation
        isFavorite: true, // Mark as favorite when manually saved
      },
    });

    return NextResponse.json({
      message: "Content saved successfully",
      content,
    });
  } catch (error) {
    console.error("Save content error:", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}
