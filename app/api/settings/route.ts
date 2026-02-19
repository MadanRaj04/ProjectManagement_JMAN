import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

// ⚠️ MOCK USER ID (REMEMBER TO REPLACE WITH REAL AUTH LATER)
const getUserId = () => {
  return "REAL_USER_ID_HERE"
}

// GET USER PROFILE
export async function GET() {
  try {
    const userId = getUserId()

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    )
  }
}

// UPDATE PROFILE
export async function PUT(req: Request) {
  try {
    const userId = getUserId()
    const body = await req.json()

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: body.username,
        email: body.email,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
