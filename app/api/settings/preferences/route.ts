import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

// ⚠️ MOCK USER ID — REPLACE WITH REAL AUTH LATER
const getUserId = () => {
  return "REAL_USER_ID_HERE"
}

// GET USER PREFERENCES
export async function GET() {
  try {
    const userId = getUserId()

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        darkMode: true,
        notificationsEnabled: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    )
  }
}

// UPDATE USER PREFERENCES
export async function PUT(req: Request) {
  try {
    const userId = getUserId()
    const { darkMode, notificationsEnabled } = await req.json()

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        darkMode,
        notificationsEnabled,
      },
      select: {
        darkMode: true,
        notificationsEnabled: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    )
  }
}
