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

    const { contentId, projectId } = await request.json();

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

    // Update content to assign/unassign project
    const updated = await prisma.content.updateMany({
      where: {
        id: contentId,
        userId: user.id,
      },
      data: {
        projectId: projectId || null,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: "Content not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update project content count
    if (projectId) {
      const contentCount = await prisma.content.count({
        where: { projectId },
      });

      await prisma.project.update({
        where: { id: projectId },
        data: { contentCount },
      });
    }

    return NextResponse.json({
      message: projectId
        ? "Content assigned to project"
        : "Content removed from project",
    });
  } catch (error) {
    console.error("Assign project error:", error);
    return NextResponse.json(
      { error: "Failed to assign project" },
      { status: 500 }
    );
  }
}
