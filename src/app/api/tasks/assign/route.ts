import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { verifyToken } from "lib/auth"
import { cookies } from "next/headers"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {

  // ── Auth Check ──────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
  // ───────────────────────────────────────────────────────────────────

  const { taskId, userId } = await req.json()

  if (!taskId || !userId) {
    return NextResponse.json(
      { error: "Task ID and user ID required" },
      { status: 400 }
    )
  }

  // Only the project manager can assign tasks
  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  });

  if (!existingTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (existingTask.project.managerId !== payload.userId) {
    return NextResponse.json(
      { error: "Only the project manager can assign tasks" },
      { status: 403 }
    );
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { assignedToId: userId }
  })

  return NextResponse.json(task)
}