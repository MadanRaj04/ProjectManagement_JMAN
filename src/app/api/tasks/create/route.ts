import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, TaskStatus } from "@prisma/client";
import { verifyToken } from "lib/auth";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

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

  const body = await req.json();
  const { title, description, priority, status, projectId, assignedToId } = body;

  if (!title || !projectId) {
    return NextResponse.json(
      { error: "Title and Project ID required" },
      { status: 400 }
    );
  }

  // Check user is manager or member of the project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true }
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const isManager = project.managerId === payload.userId;
  const isMember  = project.members.some(m => m.userId === payload.userId);

  if (!isManager && !isMember) {
    return NextResponse.json(
      { error: "You are not a member of this project" },
      { status: 403 }
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