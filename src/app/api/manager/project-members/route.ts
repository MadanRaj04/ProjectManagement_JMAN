import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { verifyToken } from "lib/auth"
import { cookies } from "next/headers"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {

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

  // Only managers can access this route
  if (payload.role !== "MANAGER") {
    return NextResponse.json({ error: "Manager access required" }, { status: 403 });
  }
  // ───────────────────────────────────────────────────────────────────

  const projectId = req.nextUrl.searchParams.get("projectId")

  if (!projectId) {
    return NextResponse.json({ error: "Project ID required" }, { status: 400 })
  }

  // Verify this manager owns the project they are querying
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.managerId !== payload.userId) {
    return NextResponse.json(
      { error: "You are not the manager of this project" },
      { status: 403 }
    );
  }

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: { user: true }
  })

  return NextResponse.json({
    projectName: project.name,
    members
  })
}