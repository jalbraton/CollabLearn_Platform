"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CollaborativeEditor } from "@/components/editor/CollaborativeEditor"
import { CommentsPanel } from "@/components/comments/CommentsPanel"
import {
  ArrowLeft,
  Save,
  Users,
  Clock,
  MessageSquare,
  Share2,
  MoreVertical,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Page {
  id: string
  title: string
  content: string
  workspaceId: string
  author: {
    id: string
    name: string
    image: string | null
  }
  updatedAt: string
  createdAt: string
}

export default function PageEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [page, setPage] = useState<Page | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(
          `/api/workspaces/${params.workspaceId}/pages/${params.pageId}`
        )
        if (res.ok) {
          const data = await res.json()
          setPage(data.page)
          setTitle(data.page.title)
          setContent(data.page.content)
        } else {
          router.push(`/workspaces/${params.workspaceId}`)
        }
      } catch (error) {
        console.error("Error fetching page:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.pageId && params.pageId !== "new") {
      fetchPage()
    } else {
      setIsLoading(false)
    }
  }, [params.pageId, params.workspaceId, router])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const url =
        params.pageId === "new"
          ? `/api/workspaces/${params.workspaceId}/pages`
          : `/api/workspaces/${params.workspaceId}/pages/${params.pageId}`

      const method = params.pageId === "new" ? "POST" : "PATCH"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      })

      if (res.ok) {
        const data = await res.json()
        setLastSaved(new Date())
        
        if (params.pageId === "new") {
          router.push(
            `/workspaces/${params.workspaceId}/pages/${data.page.id}`
          )
        }

        toast({
          title: "Saved",
          description: "Your changes have been saved",
        })
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!title || !content) return

    const timer = setTimeout(() => {
      if (params.pageId !== "new") {
        handleSave()
      }
    }, 30000)

    return () => clearTimeout(timer)
  }, [title, content])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <Link href={`/workspaces/${params.workspaceId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled"
                className="text-xl font-semibold border-none bg-transparent focus:ring-0 max-w-2xl"
              />
            </div>

            <div className="flex items-center space-x-3">
              {lastSaved && (
                <span className="text-sm text-gray-500">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Share
              </Button>

              <Button onClick={handleSave} disabled={isSaving} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>

              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Metadata */}
          {page && (
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <img
                  src={page.author.image || "/default-avatar.png"}
                  alt={page.author.name}
                  className="h-5 w-5 rounded-full mr-2"
                />
                <span>{page.author.name}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Last edited {new Date(page.updatedAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CollaborativeEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing your content..."
        />
      </div>

      {/* Sidebar - Comments */}
      <div className="fixed right-0 top-20 bottom-0 w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 hidden xl:block">
        <CommentsPanel
          workspaceId={params.workspaceId as string}
          pageId={params.pageId as string}
        />
      </div>
    </div>
  )
}
