"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, Reply } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    image: string | null
  }
  replies?: Comment[]
}

interface CommentsPanelProps {
  workspaceId: string
  pageId: string
}

export function CommentsPanel({ workspaceId, pageId }: CommentsPanelProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchComments()
  }, [workspaceId, pageId])

  const fetchComments = async () => {
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/pages/${pageId}/comments`
      )
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const handleSubmit = async (parentId?: string) => {
    if (!newComment.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/pages/${pageId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: newComment,
            parentId,
          }),
        }
      )

      if (res.ok) {
        setNewComment("")
        setReplyTo(null)
        fetchComments()
        toast({
          title: "Comment added",
          description: "Your comment has been posted",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? "ml-8" : ""} mb-4`}>
      <div className="flex items-start space-x-3">
        <img
          src={comment.author.image || "/default-avatar.png"}
          alt={comment.author.name}
          className="h-8 w-8 rounded-full"
        />
        <div className="flex-1">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {comment.author.name}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {comment.content}
            </p>
          </div>
          {!isReply && (
            <button
              onClick={() => setReplyTo(comment.id)}
              className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </button>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}

      {/* Reply Form */}
      {replyTo === comment.id && (
        <div className="ml-11 mt-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
          />
          <div className="flex justify-end space-x-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setReplyTo(null)
                setNewComment("")
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => handleSubmit(comment.id)}
              disabled={isLoading || !newComment.trim()}
            >
              Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Comments ({comments.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No comments yet. Be the first to comment!
            </p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <Button
            onClick={() => handleSubmit()}
            disabled={isLoading || !newComment.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            Comment
          </Button>
        </div>
      </div>
    </div>
  )
}
