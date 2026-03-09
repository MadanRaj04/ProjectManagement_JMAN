import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "lib/auth";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// GET /api/tasks/[taskId]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignedTo: { select: { id: true, username: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, username: true } } },
      },
    },
  });

  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json(task);
}

// PATCH /api/tasks/[taskId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token || !verifyToken(token))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, status, assignedToId, priority } = body;

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(assignedToId !== undefined && {
        assignedTo: assignedToId
          ? { connect: { id: assignedToId } }
          : { disconnect: true },
      }),
    },
    include: {
      assignedTo: { select: { id: true, username: true } },
    },
  });

  return NextResponse.json(task);
}

// DELETE /api/tasks/[taskId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token || !verifyToken(token))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Delete comments first (FK constraint), then the task
  await prisma.taskComment.deleteMany({ where: { taskId } });
  await prisma.task.delete({ where: { id: taskId } });

  return new NextResponse(null, { status: 204 });
}