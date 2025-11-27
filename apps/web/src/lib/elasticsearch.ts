import { Client } from "@elastic/elasticsearch"

const elasticClient = new Client({
  node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
  auth: process.env.ELASTICSEARCH_API_KEY
    ? {
        apiKey: process.env.ELASTICSEARCH_API_KEY,
      }
    : undefined,
})

// Initialize indices
export async function initializeIndices() {
  try {
    // Pages index
    const pagesIndexExists = await elasticClient.indices.exists({
      index: "pages",
    })

    if (!pagesIndexExists) {
      await elasticClient.indices.create({
        index: "pages",
        body: {
          mappings: {
            properties: {
              id: { type: "keyword" },
              title: { type: "text", analyzer: "standard" },
              content: { type: "text", analyzer: "standard" },
              workspaceId: { type: "keyword" },
              authorId: { type: "keyword" },
              createdAt: { type: "date" },
              updatedAt: { type: "date" },
            },
          },
        },
      })
    }

    // Files index
    const filesIndexExists = await elasticClient.indices.exists({
      index: "files",
    })

    if (!filesIndexExists) {
      await elasticClient.indices.create({
        index: "files",
        body: {
          mappings: {
            properties: {
              id: { type: "keyword" },
              filename: { type: "text", analyzer: "standard" },
              originalName: { type: "text", analyzer: "standard" },
              mimeType: { type: "keyword" },
              workspaceId: { type: "keyword" },
              uploadedById: { type: "keyword" },
              createdAt: { type: "date" },
            },
          },
        },
      })
    }
  } catch (error) {
    console.error("Error initializing Elasticsearch indices:", error)
  }
}

// Index a page
export async function indexPage(page: {
  id: string
  title: string
  content: string
  workspaceId: string
  authorId: string
  createdAt: Date
  updatedAt: Date
}) {
  try {
    await elasticClient.index({
      index: "pages",
      id: page.id,
      document: {
        ...page,
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error indexing page:", error)
  }
}

// Index a file
export async function indexFile(file: {
  id: string
  filename: string
  originalName: string
  mimeType: string
  workspaceId: string
  uploadedById: string
  createdAt: Date
}) {
  try {
    await elasticClient.index({
      index: "files",
      id: file.id,
      document: {
        ...file,
        createdAt: file.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error indexing file:", error)
  }
}

// Search pages
export async function searchPages(
  query: string,
  workspaceId?: string,
  limit = 10
) {
  try {
    const result = await elasticClient.search({
      index: "pages",
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query,
                  fields: ["title^2", "content"],
                  fuzziness: "AUTO",
                },
              },
            ],
            ...(workspaceId
              ? {
                  filter: [{ term: { workspaceId } }],
                }
              : {}),
          },
        },
        size: limit,
        highlight: {
          fields: {
            title: {},
            content: {},
          },
        },
      },
    })

    return result.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
      highlight: hit.highlight,
      score: hit._score,
    }))
  } catch (error) {
    console.error("Error searching pages:", error)
    return []
  }
}

// Search files
export async function searchFiles(
  query: string,
  workspaceId?: string,
  limit = 10
) {
  try {
    const result = await elasticClient.search({
      index: "files",
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query,
                  fields: ["filename^2", "originalName"],
                  fuzziness: "AUTO",
                },
              },
            ],
            ...(workspaceId
              ? {
                  filter: [{ term: { workspaceId } }],
                }
              : {}),
          },
        },
        size: limit,
      },
    })

    return result.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...hit._source,
      score: hit._score,
    }))
  } catch (error) {
    console.error("Error searching files:", error)
    return []
  }
}

// Delete from index
export async function deleteFromIndex(index: string, id: string) {
  try {
    await elasticClient.delete({
      index,
      id,
    })
  } catch (error) {
    console.error(`Error deleting from ${index}:`, error)
  }
}

export { elasticClient }
