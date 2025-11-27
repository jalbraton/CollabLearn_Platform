"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Users, Lock, Globe } from "lucide-react"
import Link from "next/link"

export default function NewWorkspacePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "private" as "private" | "team" | "public",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement API call to create workspace
      toast({
        title: "Workspace created!",
        description: `${formData.name} has been created successfully.`,
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workspace",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Workspace
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Workspaces help you organize your documents and collaborate with your team.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Workspace Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Product Design Team"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose a clear, descriptive name for your workspace
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What is this workspace for?"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Optional: Help your team understand the purpose of this workspace
              </p>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label>Visibility</Label>
              <div className="space-y-3">
                <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={formData.visibility === "private"}
                    onChange={(e) => setFormData({ ...formData, visibility: "private" })}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <div className="flex items-center">
                      <Lock className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        Private
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Only you can access this workspace
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="visibility"
                    value="team"
                    checked={formData.visibility === "team"}
                    onChange={(e) => setFormData({ ...formData, visibility: "team" })}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        Team
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Invite specific people to collaborate
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={formData.visibility === "public"}
                    onChange={(e) => setFormData({ ...formData, visibility: "public" })}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        Public
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Anyone with the link can view (but not edit)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link href="/dashboard">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading || !formData.name}>
                {isLoading ? "Creating..." : "Create Workspace"}
              </Button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 Tips for Workspaces
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• Use workspaces to organize different projects or teams</li>
            <li>• Invite collaborators to work together in real-time</li>
            <li>• Set appropriate permissions to control who can edit</li>
            <li>• Use tags and folders to keep your content organized</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
