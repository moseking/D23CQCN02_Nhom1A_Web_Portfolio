export type Role =
  | "admin"
  | "user"
  | "moderator";

export type Status =
  | "active"
  | "banned";

export interface User {
  _id: string;

  username: string;

  email: string;

  role: Role;

  status: Status;

  avatar?: string;

  postsCount: number;

  createdAt: string;
}

export interface Post {
  _id: string;

  title: string;

  content: string;

  author?: {
    _id: string;

    username: string;
  } | null;

  authorName: string;

  tags: string[];

  status: "draft" | "published";

  visible: boolean;

  createdAt: string;
}

export interface Comment {
  _id: string;

  post: string;

  authorName: string;

  content: string;

  visible: boolean;

  createdAt: string;
}

export interface Category {
  _id: string;

  name: string;

  slug: string;

  postsCount: number;
}
