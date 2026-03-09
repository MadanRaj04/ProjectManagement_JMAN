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

// Fetch project details, members, and tasks. Accessible by Manager OR Member
export async function GET(request: Request, context: any) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const projectId = context.params.projectId;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
            include: { user: { select: { id: true, username: true, email: true } } }
        },
        tasks: {
            include: { 
                assignedTo: { select: { id: true, username: true } },
                _count: { select: { comments: true } }
            },
            orderBy: { createdAt: 'desc' }
        },
        manager: { select: { id: true, username: true } }
      }
    });

    if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify access
    const isManager = project.managerId === user.userId;
    const isMember = project.members.some(m => m.userId === user.userId);

    if (!isManager && !isMember) {
         return NextResponse.json({ error: 'Unauthorized to view this project' }, { status: 403 });
    }

    // Filter tasks if not a manager to only show unassigned or tasks assigned to them
    if (!isManager) {
      project.tasks = project.tasks.filter(
        (t: any) => !t.assignedTo || t.assignedTo.id === user.userId
      ) as any;
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Project Details GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
