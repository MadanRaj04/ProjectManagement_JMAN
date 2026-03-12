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
            select: { members: true /* tasks removed for minimal setup */ }
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

  // helper to generate a project code based on name prefix
  async function generateProjectCode(name: string, clientName?: string) {
    const base = clientName || name;
    const prefix = base.replace(/\s+/g, '').substring(0, 3).toUpperCase();
    // count existing codes starting with the same prefix
    const existing = await prisma.project.findMany({
      where: { projectCode: { startsWith: prefix } },
      select: { projectCode: true }
    });
    const seq = existing.length + 1;
    const num = seq.toString().padStart(2, '0');
    return `${prefix}${num}`;
  }

  export async function POST(request: Request) {
    try {
      const manager = await getManagerUser();
      if (!manager) {
        return NextResponse.json({ error: 'Unauthorized. Manager access required.' }, { status: 403 });
      }

      const { name, clientName, projectDate } = await request.json();

      if (!name) {
        return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
      }

      const code = await generateProjectCode(name, clientName);

      const project = await prisma.project.create({
        data: {
          name,
          clientName: clientName || undefined,
          projectCode: code,
          projectDate: projectDate ? new Date(projectDate) : undefined,
          managerId: manager.userId,
        },
      });

      return NextResponse.json({ project, message: 'Project created successfully' }, { status: 201 });
    } catch (error) {
      console.error('Projects POST error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  export async function PATCH(request: Request) {
    try {
      const manager = await getManagerUser();
      if (!manager) {
        return NextResponse.json({ error: 'Unauthorized. Manager access required.' }, { status: 403 });
      }

      const { projectId, name, clientName, projectDate, status } = await request.json();
      if (!projectId) {
        return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
      }

      // fetch existing project so we can compare / use defaults
      const existing = await prisma.project.findUnique({ where: { id: projectId } });
      const updateData: any = {};
      if (name) updateData.name = name;
      if (clientName !== undefined) updateData.clientName = clientName;
      if ((name || clientName) && existing) {
        // recalc code if prefix data changed
        const code = await generateProjectCode(name || existing.name, clientName !== undefined ? clientName : existing.clientName || undefined);
        updateData.projectCode = code;
      }
      if (projectDate) updateData.projectDate = new Date(projectDate);
      if (status) updateData.status = status;

      // ensure manager actually owns the project
      const owned = await prisma.project.findUnique({ where: { id: projectId } });
      if (!owned || owned.managerId !== manager.userId) {
        return NextResponse.json({ error: 'Unauthorized to modify this project' }, { status: 403 });
      }
      const project = await prisma.project.update({
        where: { id: projectId },
        data: updateData,
      });

      return NextResponse.json({ project, message: 'Project updated successfully' });
    } catch (error) {
      console.error('Projects PATCH error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
