// Shared types that mirror the Prisma `Node` model returned by the backend.
// `type` is the discriminator: a folder may have children, a file has key/size/mimeType.

export type NodeType = "FOLDER" | "FILE";

export interface DriveNode {
  id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
  userId: string;
  // FILE-only fields
  key?: string | null;
  size?: number | null;
  mimeType?: string | null;
  /** True when the current user has starred this node. */
  isStarred?: boolean;
  /** Soft-delete flag — true when the node is sitting in Trash. */
  isTrashed?: boolean;
  /** ISO timestamp when the node was moved to Trash, if any. */
  trashedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type FolderNode = DriveNode & { type: "FOLDER" };
export type FileNode = DriveNode & { type: "FILE" };

export interface BreadcrumbItem {
  id: string | null; // null = root ("My Drive")
  name: string;
}
