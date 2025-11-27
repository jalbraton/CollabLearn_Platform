import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@collablearn/database"

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/workspaces/[id] - Get workspace details
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        pages: {
          orderBy: {
            updatedAt: "desc",
          },
          take: 10,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            pages: true,
            members: true,
          },
        },
      },
    })

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      )
    }

    // Check if user has access
    const member = workspace.members.find((m) => m.userId === session.user.id)
    if (!member && workspace.visibility !== "public") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ workspace })
  } catch (error) {
    console.error("Error fetching workspace:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/workspaces/[id] - Update workspace
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    // Check permissions
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: params.id,
        userId: session.user.id,
        role: {
          in: ["owner", "admin"],
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const workspace = await prisma.workspace.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
        visibility: body.visibility,
      },
    })

    return NextResponse.json({ workspace })
  } catch (error) {
    console.error("Error updating workspace:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/workspaces/[id] - Delete workspace
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is owner
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    })

    if (!workspace || workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.workspace.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Workspace deleted successfully" })
  } catch (error) {
    console.error("Error deleting workspace:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
