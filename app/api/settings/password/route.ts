import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"
import bcrypt from "bcryptjs"

// ⚠️ MOCK USER ID — REPLACE WITH REAL AUTH LATER
const getUserId = () => {
  return "REAL_USER_ID_HERE"
}

export async function PUT(req: Request) {
  try {
    const userId = getUserId()
    const { oldPassword, newPassword } = await req.json()

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both old and new passwords are required" },
        { status: 400 }
      )
    }

    // Get user from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password)

    if (!isMatch) {
      return NextResponse.json(
        { error: "Old password is incorrect" },
        { status: 401 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({
      message: "Password updated successfully",
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    )
  }
}
