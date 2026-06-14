"use client";

import { useState } from "react";
import { FiEdit3, FiTrash2 } from "react-icons/fi";

import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

type PostOwnerActionsProps = {
  postId: string;
  authorId?: string;
  authorName?: string;
};

export default function PostOwnerActions({
  postId,
  authorId,
  authorName,
}: PostOwnerActionsProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const currentUserId = user?.id || user?._id || "";
  const currentUserName = user?.username || "";

  const isOwner = Boolean(
    isAuthenticated &&
      ((authorId &&
        currentUserId &&
        authorId.toString() === currentUserId.toString()) ||
        (authorName &&
          currentUserName &&
          authorName.trim().toLowerCase() ===
            currentUserName.trim().toLowerCase()))
  );

  if (!isOwner) return null;

  const handleDelete = async () => {
    const confirmed = window.confirm("Bạn chắc chắn muốn xoá bài viết này?");
    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      const response = await api.delete(`/posts/${postId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Delete failed");
      }

      window.location.href = "/feed";
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể xoá bài viết."
      );
      setDeleting(false);
    }
  };

  return (
    <div className="post-owner-actions">
      <a href={`/edit-post/${postId}`} className="post-owner-edit">
        <FiEdit3 />
        <span>Sửa bài</span>
      </a>

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="post-owner-delete"
      >
        <FiTrash2 />
        <span>{deleting ? "Đang xoá..." : "Xoá bài"}</span>
      </button>

      {error && <p className="post-owner-error">{error}</p>}
    </div>
  );
}
