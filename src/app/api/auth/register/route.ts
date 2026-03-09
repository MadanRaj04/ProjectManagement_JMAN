import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { signToken } from 'lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { username, email, password, role } = await request.json();

    if (!username || !email || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (role !== 'USER' && role !== 'MANAGER') {
       return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email or username already in use' }, { status: 409 });
    }

    if (role === 'MANAGER') {
      const whitelisted = await prisma.managerWhitelist.findUnique({
        where: { email }
      });

      if (!whitelisted) {
        return NextResponse.json({ error: 'Email is not authorized for a Manager account' }, { status: 403 });
      }

      if (whitelisted.isRegistered) {
         return NextResponse.json({ error: 'Manager account already registered' }, { status: 409 });
      }
      
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
       const user = await tx.user.create({
         data: {
           username,
           email,
           password: hashedPassword,
           role,
           isVerified: true,
         }
       });

       if (role === 'MANAGER') {
         await tx.managerWhitelist.update({
           where: { email },
           data: { isRegistered: true }
         });
       }

       return user;
    });

    const token = signToken({ userId: newUser.id, role: newUser.role });

    const response = NextResponse.json({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      },
    }, { status: 201 });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
