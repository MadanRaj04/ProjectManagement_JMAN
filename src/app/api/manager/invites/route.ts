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

export async function POST(request: Request) {
  try {
    const manager = await getManagerUser();
    if (!manager) {
      return NextResponse.json({ error: 'Unauthorized. Manager access required.' }, { status: 403 });
    }

    const { projectId, email } = await request.json();

    if (!projectId || !email) {
      return NextResponse.json({ error: 'Project ID and email are required' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId, managerId: manager.userId }
    });

    if (!project) {
        return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    const invitee = await prisma.user.findUnique({
      where: { email }
    });

    if (!invitee) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existingMember = await prisma.projectMember.findUnique({
        where: {
            projectId_userId: { projectId, userId: invitee.id }
        }
    });

    if (existingMember) {
        return NextResponse.json({ error: 'User is already a member of this project' }, { status: 400 });
    }

    const invite = await prisma.projectInvite.create({
      data: {
        projectId,
        managerId: manager.userId,
        userId: invitee.id,
        status: 'ACCEPTED'
      }
    });

    await prisma.projectMember.create({
      data: {
        projectId,
        userId: invitee.id
      }
    });

    return NextResponse.json({ invite, message: 'Invitation sent successfully' }, { status: 201 });
  } catch (error) {
    console.error('Invites POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
