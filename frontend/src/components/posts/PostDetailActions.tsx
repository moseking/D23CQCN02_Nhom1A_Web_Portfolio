"use client";

import { useEffect, useMemo, useState } from "react";
import { FiBookmark, FiHeart, FiMessageCircle } from "react-icons/fi";

import { api } from "@/lib/axios";
import { socket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";

type PostDetailActionsProps = {
  postId: string;
  likes?: string[];
  likedBy?: string[];
  savedBy?: string[];
  commentsCount?: number;
};

export default function PostDetailActions({
  postId,
  likes = [],
  likedBy = [],
  savedBy = [],
  commentsCount = 0,
}: PostDetailActionsProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const currentUserId = user?.id || user?._id || "";

  const initialLikes = useMemo(
    () => (likedBy.length ? likedBy : likes),
    [likedBy, likes]
  );

  const [likesCount, setLikesCount] = useState(initialLikes.length);
  const [savesCount, setSavesCount] = useState(savedBy.length);
  const [commentsTotal, setCommentsTotal] = useState(commentsCount);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLikesCount(initialLikes.length);
    setSavesCount(savedBy.length);
  }, [initialLikes.length, savedBy.length]);

  useEffect(() => {
    if (!mounted || !currentUserId) return;

    setLiked(
      initialLikes.some((id) => id?.toString() === currentUserId.toString())
    );

    setSaved(savedBy.some((id) => id?.toString() === currentUserId.toString()));
  }, [currentUserId, initialLikes, mounted, savedBy]);

  useEffect(() => {
    let ignore = false;

    const fetchCommentsCount = async () => {
      try {
        const response = await api.get(`/posts/${postId}/comments`);
        const comments = response.data.data || [];
        if (!ignore) setCommentsTotal(comments.length);
      } catch {
        if (!ignore) setCommentsTotal(commentsCount);
      }
    };

    fetchCommentsCount();

    return () => {
      ignore = true;
    };
  }, [postId, commentsCount]);

  useEffect(() => {
    const handleNewComment = (payload: { postId: string }) => {
      if (payload.postId !== postId) return;
      setCommentsTotal((count) => count + 1);
    };

    const handleCommentDeleted = (payload: { postId: string }) => {
      if (payload.postId !== postId) return;
      setCommentsTotal((count) => Math.max(count - 1, 0));
    };

    const handleNewLike = (payload: {
      postId: string;
      likesCount: number;
      likes?: string[];
    }) => {
      if (payload.postId !== postId) return;

      setLikesCount(payload.likesCount || 0);

      if (currentUserId && payload.likes) {
        setLiked(
          payload.likes.some(
            (id) => id?.toString() === currentUserId.toString()
          )
        );
      }
    };

    const handleNewSave = (payload: {
      postId: string;
      savesCount: number;
      savedBy?: string[];
    }) => {
      if (payload.postId !== postId) return;

      setSavesCount(payload.savesCount || 0);

      if (currentUserId && payload.savedBy) {
        setSaved(
          payload.savedBy.some(
            (id) => id?.toString() === currentUserId.toString()
          )
        );
      }
    };

    const handleCommentVisibilityChanged = (payload: {
      postId: string;
      visible: boolean;
    }) => {
      if (payload.postId !== postId) return;

      setCommentsTotal((current) =>
        payload.visible ? current + 1 : Math.max(current - 1, 0)
      );
    };

    socket.on("new_comment", handleNewComment);
    socket.on("comment_deleted", handleCommentDeleted);
    socket.on("new_like", handleNewLike);
    socket.on("new_save", handleNewSave);
    socket.on("comment_visibility_changed", handleCommentVisibilityChanged);

    return () => {
      socket.off("new_comment", handleNewComment);
      socket.off("comment_deleted", handleCommentDeleted);
      socket.off("new_like", handleNewLike);
      socket.off("new_save", handleNewSave);
      socket.off("comment_visibility_changed", handleCommentVisibilityChanged);
    };
  }, [postId, currentUserId]);

  const handleLike = async () => {
    setError("");

    if (!mounted || !isAuthenticated) {
      setError("Bạn cần đăng nhập để thích bài viết.");
      return;
    }

    try {
      const response = await api.post(`/posts/${postId}/like`);
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Like failed");
      }

      setLiked(Boolean(result.data.liked));
      setLikesCount(result.data.likesCount || 0);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Like failed"
      );
    }
  };

  const handleSave = async () => {
    setError("");

    if (!mounted || !isAuthenticated) {
      setError("Bạn cần đăng nhập để lưu bài viết.");
      return;
    }

    try {
      const response = await api.post(`/posts/${postId}/save`);
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Save failed");
      }

      setSaved(Boolean(result.data.saved));
      setSavesCount(result.data.savesCount || 0);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Save failed"
      );
    }
  };

  return (
    <div className="mt-8 border-t border-[#dfe5d8] pt-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleLike}
          className={`like-action ${liked ? "liked" : ""}`}
        >
          <FiHeart />
          <span>{likesCount}</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className={`save-action ${saved ? "saved" : ""}`}
        >
          <FiBookmark />
          <span>{savesCount}</span>
        </button>

        <span className="comment-detail-action">
          <FiMessageCircle />
          <span>{commentsTotal}</span>
        </span>
      </div>

      {error && (
        <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
