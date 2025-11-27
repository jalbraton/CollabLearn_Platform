"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  Settings, 
  FileText,
  Clock,
  MoreVertical,
  Search
} from "lucide-react"

interface Workspace {
  id: string
  name: string
  description: string | null
  visibility: string
  owner: {
    id: string
    name: string
    email: string
    image: string | null
  }
  members: Array<{
    id: string
    role: string
    user: {
      id: string
      name: string
      email: string
      image: string | null
    }
  }>
  pages: Array<{
    id: string
    title: string
    updatedAt: string
    author: {
      id: string
      name: string
      image: string | null
    }
  }>
  _count: {
    pages: number
    members: number
  }
}

export default function WorkspaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await fetch(`/api/workspaces/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setWorkspace(data.workspace)
        } else {
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Error fetching workspace:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchWorkspace()
    }
  }, [params.id, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!workspace) {
    return null
  }

  const currentMember = workspace.members.find((m) => m.user.id === session?.user?.id)
  const canEdit = currentMember?.role === "owner" || currentMember?.role === "admin"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {workspace.name}
              </h1>
              {workspace.description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {workspace.description}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Share
              </Button>
              {canEdit && (
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              {workspace._count.pages} pages
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              {workspace._count.members} members
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Last updated {new Date(workspace.pages[0]?.updatedAt || Date.now()).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pages
                </h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Page
                  </Button>
                </div>
              </div>

              {workspace.pages.length > 0 ? (
                <div className="space-y-3">
                  {workspace.pages.map((page) => (
                    <Link
                      key={page.id}
                      href={`/workspaces/${workspace.id}/pages/${page.id}`}
                      className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                            {page.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <img
                              src={page.author.image || "/default-avatar.png"}
                              alt={page.author.name}
                              className="h-5 w-5 rounded-full mr-2"
                            />
                            <span>{page.author.name}</span>
                            <span className="mx-2">•</span>
                            <span>
                              {new Date(page.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No pages yet. Create your first page to get started.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Page
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Members ({workspace._count.members})
              </h3>
              <div className="space-y-3">
                {workspace.members.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        src={member.user.image || "/default-avatar.png"}
                        alt={member.user.name}
                        className="h-8 w-8 rounded-full mr-3"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.user.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {canEdit && (
                <Button variant="outline" className="w-full mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Members
                </Button>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No recent activity
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
