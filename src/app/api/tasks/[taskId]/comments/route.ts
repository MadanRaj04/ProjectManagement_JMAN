import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "lib/auth";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// GET /api/tasks/[taskId]/comments
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  const comments = await prisma.taskComment.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, username: true } } },
  });
  return NextResponse.json(comments);
} 

// POST /api/tasks/[taskId]/comments
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim())
    return NextResponse.json({ error: "Content required" }, { status: 400 });

  const comment = await prisma.taskComment.create({
    data: {
      content: content.trim(),
      taskId,
      userId: payload.userId,
    },
    include: { user: { select: { id: true, username: true } } },
  });

  return NextResponse.json(comment);
}