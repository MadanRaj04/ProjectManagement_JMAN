import { NextResponse } from 'next/server';
import { PrismaClient, TaskStatus } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Create a new task
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { title, projectId, assignedToId } = await request.json();

    if (!title || !projectId) {
      return NextResponse.json({ error: 'Title and Project ID are required' }, { status: 400 });
    }

    // Verify authorized access to project (Manager or Member)
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { members: true }
    });

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const isManager = project.managerId === user.userId;
    const isMember = project.members.some(m => m.userId === user.userId);

    if (!isManager && !isMember) {
         return NextResponse.json({ error: 'Unauthorized to create tasks in this project' }, { status: 403 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        projectId,
        assignedToId: assignedToId || null,
        status: TaskStatus.TODO
      },
      include: {
          assignedTo: { select: { id: true, username: true } },
          _count: { select: { comments: true } }
      }
    });

    return NextResponse.json({ task, message: 'Task created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Tasks POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update a task (primarily for drag and drop status changes)
export async function PATCH(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { taskId, status } = await request.json();

    if (!taskId || !status) {
      return NextResponse.json({ error: 'Task ID and Status are required' }, { status: 400 });
    }

    if (!Object.values(TaskStatus).includes(status)) {
         return NextResponse.json({ error: 'Invalid task status' }, { status: 400 });
    }

    // Verify the task exists and user has access to its project
    const existingTask = await prisma.task.findUnique({
        where: { id: taskId },
        include: { 
            project: { include: { members: true } }
        }
    });

    if (!existingTask) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const isManager = existingTask.project.managerId === user.userId;
    const isMember = existingTask.project.members.some(m => m.userId === user.userId);

    if (!isManager && !isMember) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { status },
        include: {
            assignedTo: { select: { id: true, username: true } },
            _count: { select: { comments: true } }
        }
    });

    return NextResponse.json({ task: updatedTask, message: 'Task updated successfully' });

  } catch (error) {
    console.error('Tasks PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
