import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, username, password } = await req.json();

    // 1️⃣ Check whitelist
    const whitelist = await prisma.managerWhitelist.findUnique({
      where: { email },
    });

    if (!whitelist) {
      return NextResponse.json(
        { message: "Invalid Manager Email" },
        { status: 400 }
      );
    }

    if (whitelist.isRegistered) {
      return NextResponse.json(
        { message: "Manager already registered" },
        { status: 400 }
      );
    }

    // 2️⃣ Check username unique
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { message: "Username already taken" },
        { status: 400 }
      );
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: "MANAGER",
      },
    });

    // 5️⃣ Update whitelist
    await prisma.managerWhitelist.update({
      where: { email },
      data: { isRegistered: true },
    });

    return NextResponse.json(
      { message: "Manager registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
