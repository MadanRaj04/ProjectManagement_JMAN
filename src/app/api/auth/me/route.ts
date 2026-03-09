import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from 'lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        projectMembers: {
          include: {
            project: true
          }
        },
        tasks: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const responseUser = {
      ...user,
      projects: user.projectMembers || [],
      assignedTasks: user.tasks || []
    };

    return NextResponse.json({ user: responseUser });

  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
