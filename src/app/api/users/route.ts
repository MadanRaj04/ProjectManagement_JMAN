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

    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
