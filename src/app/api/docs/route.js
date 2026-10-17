import { NextResponse } from "next/server";

export async function GET() {
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "BookLeaf Author Support & Communication Portal API",
      version: "1.0.0",
      description: "RESTful API powering BookLeaf Publishing author support tickets, author dashboards, and admin AI operations."
    },
    servers: [
      {
        url: "/api",
        description: "Local & Production API Base"
      }
    ],
    paths: {
      "/auth/login": {
        post: {
          summary: "Authenticate author or admin",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                    role: { type: "string", enum: ["author", "admin"] }
                  },
                  required: ["email"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Successful login returning JWT and user profile" },
            "401": { description: "Invalid credentials" }
          }
        }
      },
      "/auth/me": {
        get: {
          summary: "Retrieve current authenticated profile",
          responses: {
            "200": { description: "Current user profile and books if author" },
            "401": { description: "Unauthenticated" }
          }
        }
      },
      "/auth/logout": {
        post: {
          summary: "Clear session authentication cookies",
          responses: {
            "200": { description: "Logged out" }
          }
        }
      },
      "/books": {
        get: {
          summary: "Get books for author or all books for admin",
          responses: {
            "200": { description: "Array of published and in-production books" },
            "401": { description: "Unauthorized" }
          }
        }
      },
      "/tickets": {
        get: {
          summary: "List tickets with filtering and role segregation",
          parameters: [
            { name: "status", in: "query", schema: { type: "string" } },
            { name: "category", in: "query", schema: { type: "string" } },
            { name: "priority", in: "query", schema: { type: "string" } },
            { name: "sort", in: "query", schema: { type: "string" } },
            { name: "search", in: "query", schema: { type: "string" } }
          ],
          responses: {
            "200": { description: "Array of tickets" }
          }
        },
        post: {
          summary: "Create support ticket with AI auto-classification",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    subject: { type: "string" },
                    description: { type: "string" },
                    book_id: { type: "string" },
                    attachments: { type: "array" }
                  },
                  required: ["subject", "description"]
                }
              }
            }
          },
          responses: {
            "201": { description: "Ticket created and classified" }
          }
        }
      },
      "/tickets/{id}": {
        get: {
          summary: "Get single ticket details",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Ticket details" },
            "403": { description: "Forbidden" },
            "404": { description: "Not found" }
          }
        },
        patch: {
          summary: "Update ticket status, priority override, or assignment",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    priority: { type: "string" },
                    category: { type: "string" },
                    assigned_to: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Ticket updated" }
          }
        }
      },
      "/tickets/{id}/messages": {
        post: {
          summary: "Post a message or response to a ticket thread",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    content: { type: "string" },
                    status: { type: "string" }
                  },
                  required: ["content"]
                }
              }
            }
          },
          responses: {
            "201": { description: "Message posted" }
          }
        }
      },
      "/tickets/{id}/notes": {
        post: {
          summary: "Add admin-only internal note",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    content: { type: "string" }
                  },
                  required: ["content"]
                }
              }
            }
          },
          responses: {
            "201": { description: "Internal note added" },
            "403": { description: "Admins only" }
          }
        }
      },
      "/tickets/{id}/ai-draft": {
        post: {
          summary: "Generate or regenerate AI draft response based on Knowledge Base",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Generated AI draft text" },
            "403": { description: "Admins only" }
          }
        }
      },
      "/seed": {
        post: {
          summary: "Reset database to initial 10 authors and 18 books dataset",
          responses: {
            "200": { description: "Reset completed" }
          }
        }
      }
    }
  };

  return NextResponse.json(spec);
}
