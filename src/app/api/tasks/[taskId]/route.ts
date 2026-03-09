import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

async function getManagerUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'MANAGER') return null;
  return payload;
}

export async function DELETE(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const manager = await getManagerUser();
    if (!manager) {
      return NextResponse.json({ error: "Unauthorized. Only managers can delete tasks." }, { status: 401 });
    }

    const { taskId } = params;

    // Verify task exists and belongs to a project the manager owns
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.project.managerId !== manager.userId) {
      return NextResponse.json({ error: "Unauthorized. You do not manage this project." }, { status: 403 });
    }

    // Delete the task
    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task err:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
