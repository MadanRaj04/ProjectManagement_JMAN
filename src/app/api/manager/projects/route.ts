import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from 'lib/auth';
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

export async function GET() {
  try {
    const manager = await getManagerUser();
    if (!manager) {
      return NextResponse.json({ error: 'Unauthorized. Manager access required.' }, { status: 403 });
    }

    const projects = await prisma.project.findMany({
      where: { managerId: manager.userId },
      include: {
        _count: {
          select: { members: true, tasks: true }
        }
      },
      orderBy: { id: 'desc' }
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Projects GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const manager = await getManagerUser();
    if (!manager) {
      return NextResponse.json({ error: 'Unauthorized. Manager access required.' }, { status: 403 });
    }

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        managerId: manager.userId,
      }
    });

    return NextResponse.json({ project, message: 'Project created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Projects POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
