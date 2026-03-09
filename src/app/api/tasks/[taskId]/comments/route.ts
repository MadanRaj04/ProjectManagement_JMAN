import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Add a comment to a task
export async function POST(request: Request, context: any) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const taskId = context.params.taskId;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    // Verify task exists and user has access (Manager or Member)
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { project: { include: { members: true } } }
    });

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const isManager = task.project.managerId === user.userId;
    const isMember = task.project.members.some(m => m.userId === user.userId);

    if (!isManager && !isMember) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const comment = await prisma.taskComment.create({
      data: {
        content,
        taskId,
        userId: user.userId
      },
      include: {
          user: { select: { id: true, username: true } }
      }
    });

    return NextResponse.json({ comment, message: 'Comment added' }, { status: 201 });
  } catch (error) {
    console.error('Task Comments POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get all comments for a task
export async function GET(request: Request, context: any) {
   try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const taskId = context.params.taskId;

    // Verify task exists and user has access
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { project: { include: { members: true } } }
    });

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const isManager = task.project.managerId === user.userId;
    const isMember = task.project.members.some(m => m.userId === user.userId);

    if (!isManager && !isMember) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const comments = await prisma.taskComment.findMany({
      where: { taskId },
      include: {
          user: { select: { id: true, username: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Task Comments GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
