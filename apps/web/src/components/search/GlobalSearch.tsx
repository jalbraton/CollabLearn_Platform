"use client"

import { useState, useEffect, useCallback } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, File, FileText, Loader2 } from "lucide-react"
import Link from "next/link"

interface SearchResult {
  pages: Array<{
    id: string
    title: string
    content: string
    workspaceId: string
    workspace: { id: string; name: string }
    author: { id: string; name: string; image: string | null }
    highlight?: any
    score: number
  }>
  files: Array<{
    id: string
    filename: string
    originalName: string
    mimeType: string
    workspaceId: string
    workspace: { id: string; name: string }
    uploadedBy: { id: string; name: string; image: string | null }
    score: number
  }>
}

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId?: string
}

export function GlobalSearch({ open, onOpenChange, workspaceId }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null)
      return
    }

    setIsSearching(true)
    try {
      const params = new URLSearchParams({ q: searchQuery })
      if (workspaceId) {
        params.append("workspaceId", workspaceId)
      }

      const res = await fetch(`/api/search?${params}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }, [workspaceId])

  useEffect(() => {
    search(debouncedQuery)
  }, [debouncedQuery, search])

  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults(null)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, files..."
            className="pl-10"
            autoFocus
          />
        </div>

        <div className="mt-4 max-h-[500px] overflow-y-auto">
          {isSearching && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {!isSearching && results && (
            <div className="space-y-6">
              {/* Pages */}
              {results.pages.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Pages ({results.pages.length})
                  </h3>
                  <div className="space-y-2">
                    {results.pages.map((page) => (
                      <Link
                        key={page.id}
                        href={`/workspaces/${page.workspaceId}/pages/${page.id}`}
                        onClick={() => onOpenChange(false)}
                        className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {page.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {page.content.substring(0, 150)}...
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs text-gray-500">
                                in {page.workspace.name}
                              </span>
                              {page.author && (
                                <>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-500">
                                    by {page.author.name}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {results.files.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Files ({results.files.length})
                  </h3>
                  <div className="space-y-2">
                    {results.files.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <File className="h-5 w-5 text-green-600 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {file.originalName}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs text-gray-500">
                                in {file.workspace.name}
                              </span>
                              {file.uploadedBy && (
                                <>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-500">
                                    by {file.uploadedBy.name}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {results.pages.length === 0 && results.files.length === 0 && query && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No results found for "{query}"
                  </p>
                </div>
              )}
            </div>
          )}

          {!isSearching && !results && !query && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                Start typing to search...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
