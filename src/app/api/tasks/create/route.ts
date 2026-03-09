import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, priority, status, projectId, assignedToId } = body;

  if (!title || !projectId) {
    return NextResponse.json(
      { error: "Title and Project ID required" },
      { status: 400 }
    );
  }

  const task = await prisma.task.create({
    data: {
      title,
      description:  description  ?? null,
      priority:     priority     ?? 2,
      status:       status       ?? TaskStatus.TODO,
      projectId,
      ...(assignedToId && { assignedTo: { connect: { id: assignedToId } } }),
    },
    include: {
      assignedTo: { select: { id: true, username: true } },
    },
  });

  return NextResponse.json(task);
}