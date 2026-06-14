"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiBookmark,
  FiHeart,
  FiMessageCircle,
  FiTrash2,
} from "react-icons/fi";
import { api } from "../../lib/axios";
import { socket } from "../../lib/socket";
import { useAuthStore } from "../../store/authStore";

type MediaItem = {
  url?: string;
  type?: string;
};

type Author = {
  _id?: string;
  username?: string;
  avatar?: string;
};

type Post = {
  _id: string;
  title?: string;
  content?: string;
  media?: MediaItem[];
  image?: string;
  tags?: string[];
  author?: Author;
  authorName?: string;
  likes?: string[];
  savedBy?: string[];
  commentsCount?: number;
  createdAt?: string;
};

const SPECIAL_TAGS: Record<string, string> = {
  "ui/ux": "UI/UX",
  ai: "AI",
  "3d": "3D",
};

function formatTagLabel(tag: string) {
  const cleanTag = String(tag).trim().replace(/\s+/g, " ");
  const lowerTag = cleanTag.toLowerCase();

  if (SPECIAL_TAGS[lowerTag]) {
    return SPECIAL_TAGS[lowerTag];
  }

  return cleanTag
    .split(" ")
    .map((word) => {
      const lowerWord = word.toLowerCase();

      if (SPECIAL_TAGS[lowerWord]) {
        return SPECIAL_TAGS[lowerWord];
      }

      if (word.includes("/")) {
        return word
          .split("/")
          .map((part) => {
            const lowerPart = part.toLowerCase();

            if (SPECIAL_TAGS[lowerPart]) {
              return SPECIAL_TAGS[lowerPart];
            }

            return part
              ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
              : "";
          })
          .join("/");
      }

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function isVideoMedia(url?: string, type?: string) {
  return (
    type?.includes("video") ||
    url?.includes("/video/upload/") ||
    Boolean(url?.match(/\.(mp4|webm|ogg|mov)$/i))
  );
}

export default function SavedPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const postsRef = useRef<Post[]>([]);
  const authUser = useAuthStore((state) => state.user);
  const currentUserId = authUser?.id || authUser?._id || "";

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts/saved");
      setPosts(response.data.data || []);
    } catch (error) {
      console.log("Fetch saved posts error:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedPost = async (postId: string) => {
    try {
      setRemovingId(postId);

      await api.post(`/posts/${postId}/save`);

      setPosts((current) => current.filter((post) => post._id !== postId));
    } catch (error) {
      console.log("Remove saved post error:", error);
    } finally {
      setRemovingId(null);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  useEffect(() => {
    const handlePostDeleted = (payload: { postId: string }) => {
      setPosts((current) =>
        current.filter((post) => post._id !== payload.postId)
      );
    };

    const handlePostUpdated = (payload: { post: Post }) => {
      setPosts((current) =>
        current.map((post) =>
          post._id === payload.post._id
            ? {
                ...post,
                ...payload.post,
              }
            : post
        )
      );
    };

    const handleNewLike = (payload: {
      postId: string;
      likesCount: number;
      likes?: string[];
    }) => {
      setPosts((current) =>
        current.map((post) =>
          post._id === payload.postId
            ? {
                ...post,
                likes: payload.likes || post.likes,
              }
            : post
        )
      );
    };

    const handleNewComment = (payload: { postId: string }) => {
      setPosts((current) =>
        current.map((post) =>
          post._id === payload.postId
            ? {
                ...post,
                commentsCount: (post.commentsCount || 0) + 1,
              }
            : post
        )
      );
    };

    const handleCommentDeleted = (payload: { postId: string }) => {
      setPosts((current) =>
        current.map((post) =>
          post._id === payload.postId
            ? {
                ...post,
                commentsCount: Math.max((post.commentsCount || 0) - 1, 0),
              }
            : post
        )
      );
    };

    const handleNewSave = async (payload: {
      postId: string;
      savedBy?: string[];
    }) => {
      if (!currentUserId) return;

      const isSavedByMe = (payload.savedBy || []).some(
        (id) => id.toString() === currentUserId.toString()
      );

      if (!isSavedByMe) {
        setPosts((current) =>
          current.filter((post) => post._id !== payload.postId)
        );
        return;
      }

      const alreadyInSaved = postsRef.current.some(
        (post) => post._id === payload.postId
      );

      if (alreadyInSaved) {
        setPosts((current) =>
          current.map((post) =>
            post._id === payload.postId
              ? {
                  ...post,
                  savedBy: payload.savedBy || post.savedBy,
                }
              : post
          )
        );
        return;
      }

      try {
        const response = await api.get(`/posts/${payload.postId}`);
        const post = response.data.data || response.data.post || response.data;

        setPosts((current) => {
          const existed = current.some((item) => item._id === post._id);
          if (existed) return current;
          return [post, ...current];
        });
      } catch (error) {
        console.log("Fetch realtime saved post error:", error);
      }
    };

    socket.on("post_deleted", handlePostDeleted);
    socket.on("post_updated", handlePostUpdated);
    socket.on("new_like", handleNewLike);
    socket.on("new_comment", handleNewComment);
    socket.on("comment_deleted", handleCommentDeleted);
    socket.on("new_save", handleNewSave);

    return () => {
      socket.off("post_deleted", handlePostDeleted);
      socket.off("post_updated", handlePostUpdated);
      socket.off("new_like", handleNewLike);
      socket.off("new_comment", handleNewComment);
      socket.off("comment_deleted", handleCommentDeleted);
      socket.off("new_save", handleNewSave);
    };
  }, [currentUserId]);

  const renderMedia = (post: Post) => {
    const media = post.media?.[0];

    if (media?.url) {
      const isVideo = isVideoMedia(media.url, media.type);

      if (isVideo) {
        return (
          <video
            controls
            preload="metadata"
            src={media.url}
            className="saved-post-media"
          />
        );
      }

      return (
        <img
          src={media.url}
          alt={post.title || "Saved post"}
          className="saved-post-media"
          loading="lazy"
          decoding="async"
        />
      );
    }

    if (post.image) {
      const isVideo = isVideoMedia(post.image);

      if (isVideo) {
        return (
          <video
            controls
            preload="metadata"
            src={post.image}
            className="saved-post-media"
          />
        );
      }

      return (
        <img
          src={post.image}
          alt={post.title || "Saved post"}
          className="saved-post-media"
          loading="lazy"
          decoding="async"
        />
      );
    }

    return <div className="saved-post-placeholder">No media</div>;
  };

  return (
    <main className="saved-page">
      <div className="saved-header">
        <div>
          <p className="saved-kicker">Saved Collection</p>
          <h1>Bài viết đã lưu</h1>
          <p>Lưu lại những tác phẩm bạn muốn xem lại sau.</p>
        </div>

        <Link href="/" className="saved-back-link">
          <FiArrowLeft />
          <span>Về trang chủ</span>
        </Link>
      </div>

      {loading ? (
        <div className="saved-state">Đang tải bài viết đã lưu...</div>
      ) : posts.length === 0 ? (
        <div className="saved-empty">
          <span>
            <FiBookmark />
          </span>
          <h2>Chưa có bài viết đã lưu</h2>
          <p>
            Khi bạn bấm lưu một bài viết, bài viết đó sẽ xuất hiện ở đây để xem
            lại nhanh hơn.
          </p>
          <Link href="/">Khám phá bài viết</Link>
        </div>
      ) : (
        <section className="saved-grid">
          {posts.map((post) => {
            const authorName =
              post.author?.username || post.authorName || "Unknown creator";

            return (
              <article className="saved-card" key={post._id}>
                {renderMedia(post)}

                <div className="saved-card-body">
                  {post.author?._id ? (
                    <Link
                      href={`/users/${post.author._id}`}
                      className="saved-author"
                    >
                      {post.author?.avatar ? (
                        <img
                          src={post.author.avatar}
                          alt={authorName}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <span>{authorName.charAt(0).toUpperCase()}</span>
                      )}

                      <div>
                        <strong>{authorName}</strong>
                        {post.createdAt && (
                          <small>
                            {new Date(post.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </small>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="saved-author">
                      <span>{authorName.charAt(0).toUpperCase()}</span>
                      <div>
                        <strong>{authorName}</strong>
                        {post.createdAt && (
                          <small>
                            {new Date(post.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </small>
                        )}
                      </div>
                    </div>
                  )}

                  <h2>
                    <Link href={`/posts/${post._id}`}>
                      {post.title || "Không có tiêu đề"}
                    </Link>
                  </h2>

                  {post.content && <p>{post.content}</p>}

                  {post.tags?.length ? (
                    <div className="saved-tags">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span key={tag}>{formatTagLabel(tag)}</span>
                      ))}
                    </div>
                  ) : null}

                  <div className="saved-actions">
                    <span>
                      <FiHeart />
                      {post.likes?.length || 0}
                    </span>

                    <span>
                      <FiMessageCircle />
                      {post.commentsCount || 0}
                    </span>

                    <Link
                      href={`/posts/${post._id}`}
                      className="saved-detail-link"
                    >
                      Xem chi tiết
                    </Link>

                    <button
                      type="button"
                      onClick={() => removeSavedPost(post._id)}
                      disabled={removingId === post._id}
                    >
                      <FiTrash2 />
                      {removingId === post._id ? "Đang bỏ lưu..." : "Bỏ lưu"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
