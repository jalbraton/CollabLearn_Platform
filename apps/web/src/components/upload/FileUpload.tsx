"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Upload, File, X, Loader2 } from "lucide-react"

interface FileUploadProps {
  workspaceId: string
  pageId?: string
  onUploadComplete?: (file: any) => void
  maxSize?: number // in MB
  acceptedTypes?: string[]
}

export function FileUpload({
  workspaceId,
  pageId,
  onUploadComplete,
  maxSize = 10,
  acceptedTypes = ["image/*", "application/pdf", ".doc", ".docx", ".txt"],
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxSize}MB`,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      if (pageId) {
        formData.append("pageId", pageId)
      }

      const res = await fetch(`/api/workspaces/${workspaceId}/upload`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error("Upload failed")
      }

      const data = await res.json()

      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully`,
      })

      onUploadComplete?.(data.file)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
        accept={acceptedTypes.join(",")}
        disabled={isUploading}
      />

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Uploading...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
              Drop your file here, or{" "}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-800"
              >
                browse
              </button>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Maximum file size: {maxSize}MB
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
