import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { searchPages, searchFiles } from "@/lib/elasticsearch"
import { prisma } from "@collablearn/database"

// GET /api/search - Global search across pages and files
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")
    const workspaceId = searchParams.get("workspaceId")
    const type = searchParams.get("type") // 'pages', 'files', or 'all'

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      )
    }

    // If workspaceId is provided, verify access
    if (workspaceId) {
      const member = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId: session.user.id,
        },
      })

      if (!member) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Get user's accessible workspaces if no specific workspace is provided
    let accessibleWorkspaceIds: string[] = []
    if (!workspaceId) {
      const memberships = await prisma.workspaceMember.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          workspaceId: true,
        },
      })
      accessibleWorkspaceIds = memberships.map((m) => m.workspaceId)
    }

    let pages: any[] = []
    let files: any[] = []

    // Search pages
    if (type === "pages" || type === "all" || !type) {
      const pageResults = await searchPages(query, workspaceId || undefined)

      // Filter by accessible workspaces
      pages = workspaceId
        ? pageResults
        : pageResults.filter((p) =>
            accessibleWorkspaceIds.includes(p.workspaceId)
          )

      // Enrich with database data
      const pageIds = pages.map((p) => p.id)
      const dbPages = await prisma.page.findMany({
        where: {
          id: { in: pageIds },
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          workspace: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      pages = pages.map((p) => {
        const dbPage = dbPages.find((dp) => dp.id === p.id)
        return {
          ...p,
          author: dbPage?.author,
          workspace: dbPage?.workspace,
        }
      })
    }

    // Search files
    if (type === "files" || type === "all" || !type) {
      const fileResults = await searchFiles(query, workspaceId || undefined)

      // Filter by accessible workspaces
      files = workspaceId
        ? fileResults
        : fileResults.filter((f) =>
            accessibleWorkspaceIds.includes(f.workspaceId)
          )

      // Enrich with database data
      const fileIds = files.map((f) => f.id)
      const dbFiles = await prisma.fileUpload.findMany({
        where: {
          id: { in: fileIds },
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          workspace: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      files = files.map((f) => {
        const dbFile = dbFiles.find((df) => df.id === f.id)
        return {
          ...f,
          uploadedBy: dbFile?.uploadedBy,
          workspace: dbFile?.workspace,
        }
      })
    }

    return NextResponse.json({
      query,
      results: {
        pages,
        files,
      },
      total: pages.length + files.length,
    })
  } catch (error) {
    console.error("Error searching:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
