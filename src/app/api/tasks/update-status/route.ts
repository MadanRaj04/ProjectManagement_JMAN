import { NextRequest, NextResponse } from "next/server"
import { PrismaClient, TaskStatus } from "@prisma/client"
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

  const { taskId, status } = await req.json()

  if (!taskId || !status) {
    return NextResponse.json(
      { error: "Task ID and status required" },
      { status: 400 }
    )
  }

  // Check user belongs to the project this task is in
  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { include: { members: true } } }
  });

  if (!existingTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const isManager = existingTask.project.managerId === payload.userId;
  const isMember  = existingTask.project.members.some(m => m.userId === payload.userId);

  if (!isManager && !isMember) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: status as TaskStatus
    }
  })

  return NextResponse.json(task)
}