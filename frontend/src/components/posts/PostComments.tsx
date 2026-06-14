"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { socket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";

type CommentItem = {
  _id?: string;
  id?: string;
  authorName?: string;
  content: string;
  createdAt?: string;
  author?: {
    username?: string;
    avatar?: string;
  };
};

export default function PostComments({ postId }: { postId: string }) {
  const { isAuthenticated, user } = useAuthStore();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const normalizeComment = (comment: any): CommentItem => ({
    _id: comment._id || comment.id,
    id: comment._id || comment.id,
    authorName:
      comment.author?.username || comment.authorName || "Unknown user",
    author: comment.author,
    content: comment.content || "",
    createdAt: comment.createdAt,
  });

  const getCommentId = (comment: CommentItem) =>
    comment._id ||
    comment.id ||
    `${comment.authorName || "user"}-${comment.createdAt || ""}-${
      comment.content
    }`;

  const addCommentOnce = (current: CommentItem[], comment: CommentItem) => {
    const commentId = getCommentId(comment);

    if (current.some((item) => getCommentId(item) === commentId)) {
      return current;
    }

    return [comment, ...current];
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadComments() {
      try {
        setLoading(true);
        const res = await api.get(`/posts/${postId}/comments`);
        const data = res.data.data || [];
        setComments(data.map(normalizeComment));
      } catch {
        setComments([]);
      } finally {
        setLoading(false);
      }
    }

    loadComments();
  }, [postId]);

  useEffect(() => {
    const handleNewComment = (payload: { postId: string; comment: any }) => {
      if (payload.postId !== postId) return;

      const newComment = normalizeComment(payload.comment);
      setComments((current) => addCommentOnce(current, newComment));
    };

    const handleCommentDeleted = (payload: {
      postId: string;
      commentId: string;
    }) => {
      if (payload.postId !== postId) return;

      setComments((current) =>
        current.filter(
          (comment) =>
            comment._id !== payload.commentId &&
            comment.id !== payload.commentId
        )
      );
    };

    const handleCommentVisibilityChanged = (payload: {
      commentId: string;
      postId: string;
      visible: boolean;
      comment?: CommentItem;
    }) => {
      if (payload.postId !== postId) return;

      if (!payload.visible) {
        setComments((current) =>
          current.filter((comment) => {
            const id = comment._id || comment.id;
            return id !== payload.commentId;
          })
        );

        return;
      }

      if (payload.comment) {
        setComments((current) => {
          const existed = current.some((comment) => {
            const id = comment._id || comment.id;
            return id === payload.commentId;
          });

          if (existed) return current;

          return [payload.comment!, ...current];
        });
      }
    };

    socket.on("new_comment", handleNewComment);
    socket.on("comment_deleted", handleCommentDeleted);
    socket.on("comment_visibility_changed", handleCommentVisibilityChanged);

    return () => {
      socket.off("new_comment", handleNewComment);
      socket.off("comment_deleted", handleCommentDeleted);
      socket.off("comment_visibility_changed", handleCommentVisibilityChanged);
    };
  }, [postId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!mounted || !isAuthenticated) {
      setError("Bạn cần đăng nhập để bình luận.");
      return;
    }

    if (!content.trim()) {
      setError("Nội dung bình luận không được để trống.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await api.post(`/posts/${postId}/comments`, {
        content: content.trim(),
      });

      if (!res.data.success) {
        throw new Error(res.data.message || "Comment failed");
      }

      const newComment = normalizeComment(res.data.data);
      setComments((current) => addCommentOnce(current, newComment));
      setContent("");
    } catch {
      setError("Không thể gửi bình luận.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="flex max-h-[calc(100vh-140px)] flex-col overflow-hidden rounded-[24px] border border-[#e1e6db] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7b8f68]">
            Comments
          </p>
          <h2 className="mt-1 text-2xl font-bold">
            {comments.length} bình luận
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={
            mounted && isAuthenticated
              ? `Bình luận với tên ${user?.username || "user"}...`
              : "Đăng nhập để bình luận..."
          }
          className="min-h-24 w-full resize-none rounded-2xl border border-[#dfe5d8] bg-[#f7f8f3] p-4 outline-none focus:ring-2 focus:ring-[#9caf88]"
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          {error && (
            <p className="text-sm font-semibold text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="ml-auto rounded-full bg-[#252525] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {submitting ? "Đang gửi..." : "Gửi bình luận"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-slate-500">Đang tải bình luận...</p>
      ) : comments.length === 0 ? (
        <p className="rounded-2xl bg-[#f7f8f3] p-4 text-slate-500">
          Chưa có bình luận nào.
        </p>
      ) : (
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
          {comments.map((comment, index) => (
            <article
              key={`${getCommentId(comment)}-${index}`}
              className="rounded-2xl bg-[#f7f8f3] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#9caf88] font-bold text-white">
                  {(comment.author?.username || comment.authorName || "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {comment.author?.username ||
                      comment.authorName ||
                      "Unknown"}
                  </strong>

                  <p className="mt-1 leading-7 text-slate-700">
                    {comment.content}
                  </p>

                  {comment.createdAt && (
                    <small className="mt-2 block text-slate-400">
                      {new Date(comment.createdAt).toLocaleString("vi-VN")}
                    </small>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
