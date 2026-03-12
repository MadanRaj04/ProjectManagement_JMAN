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

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  return payload;
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');

    let where: any = {};

    if (user.role === "MANAGER") {
      if (projectId) where.projectId = projectId;
    }

    if (user.role === "USER") {
      where.userId = user.userId;
    }

    const allocations = await prisma.resourceAllocation.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, email: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { startDate: 'asc' }
    });

    return NextResponse.json({ allocations });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const manager = await getManagerUser();
    if (!manager) {
      return NextResponse.json({ error: 'Unauthorized. Manager access required.' }, { status: 403 });
    }

    const { userId, projectId, startDate, endDate, allocationPercentage } = await request.json();

    if (!userId || !projectId || !startDate || !endDate || allocationPercentage == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 });
    }

    // check overlapping allocations for the same user
    const overlapping = await prisma.resourceAllocation.findMany({
      where: {
        userId,
        AND: [
          { startDate: { lte: end } },
          { endDate: { gte: start } },
        ],
      },
    });

    for (const alloc of overlapping) {
      if (alloc.allocationPercentage + allocationPercentage > 100) {
        return NextResponse.json({
          error: 'Allocation would push user above 100% during overlapping period',
        }, { status: 400 });
      }
    }

    const allocation = await prisma.resourceAllocation.create({
      data: {
        userId,
        projectId,
        startDate: start,
        endDate: end,
        allocationPercentage: allocationPercentage,
      },
    });

    return NextResponse.json({ allocation, message: 'Allocation created' }, { status: 201 });
  } catch (error) {
    console.error('Allocations POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
