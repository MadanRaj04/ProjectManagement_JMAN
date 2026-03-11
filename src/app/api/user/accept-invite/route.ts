import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { verifyToken } from "lib/auth"
import { cookies } from "next/headers"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {

  // ── Auth Check ──────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
  // ───────────────────────────────────────────────────────────────────

  const { inviteId, projectId } = await req.json()

  // userId comes from the verified token — NEVER trust userId from request body
  const userId = payload.userId;

  if (!inviteId || !projectId) {
    return NextResponse.json(
      { error: "Invite ID and Project ID required" },
      { status: 400 }
    );
  }

  // Verify the invite exists and belongs to this user
  const invite = await prisma.projectInvite.findUnique({
    where: { id: inviteId }
  });

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.userId !== userId) {
    return NextResponse.json(
      { error: "This invite does not belong to you" },
      { status: 403 }
    );
  }

  if (invite.status !== "PENDING") {
    return NextResponse.json(
      { error: "Invite already accepted or no longer valid" },
      { status: 400 }
    );
  }

  // Use a transaction — both updates succeed or both fail together
  await prisma.$transaction([
    prisma.projectInvite.update({
      where: { id: inviteId },
      data: { status: "ACCEPTED" }
    }),
    prisma.projectMember.create({
      data: { projectId, userId }
    })
  ]);

  return NextResponse.json({ message: "Invite accepted" })
}