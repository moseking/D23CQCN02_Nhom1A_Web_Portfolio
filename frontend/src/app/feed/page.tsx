"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiImage,
  FiTag,
  FiX,
} from "react-icons/fi";
import { api } from "../../lib/axios";
import { socket } from "../../lib/socket";

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
  tags?: string[];
  author?: Author;
  authorName?: string;
  createdAt?: string;
  likes?: string[];
  savedBy?: string[];
  commentsCount?: number;
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

export default function FeedPage() {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingSelectedPost, setLoadingSelectedPost] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelectedPostId(params.get("postId"));
  }, []);

  useEffect(() => {
    const fetchSelectedPost = async () => {
      if (!selectedPostId) return;

      try {
        setLoadingSelectedPost(true);

        const res = await api.get(`/posts/${selectedPostId}`);
        setSelectedPost(res.data.data || res.data.post || res.data);
      } catch (error) {
        console.log("Fetch selected post error:", error);
      } finally {
        setLoadingSelectedPost(false);
      }
    };

    fetchSelectedPost();
  }, [selectedPostId]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);

        let page = 1;
        let totalPages = 1;
        const allPosts: Post[] = [];

        do {
          const res = await api.get("/posts", {
            params: {
              page,
              limit: 50,
            },
          });

          const pagePosts = res.data.data || res.data.posts || [];
          allPosts.push(...pagePosts);

          totalPages = res.data.pagination?.totalPages || 1;
          page += 1;
        } while (page <= totalPages);

        const uniquePosts = Array.from(
          new Map(allPosts.map((post) => [post._id, post])).values()
        );

        setPosts(uniquePosts);
      } catch (error) {
        console.log("Fetch posts error:", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const handleNewPost = (payload: { post: Post }) => {
      setPosts((current) => {
        const existed = current.some((post) => post._id === payload.post._id);
        if (existed) return current;
        return [payload.post, ...current];
      });
    };

    const handlePostDeleted = (payload: { postId: string }) => {
      setPosts((current) =>
        current.filter((post) => post._id !== payload.postId)
      );

      setSelectedPost((current) =>
        current?._id === payload.postId ? null : current
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

      setSelectedPost((current) =>
        current?._id === payload.post._id
          ? {
              ...current,
              ...payload.post,
            }
          : current
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

      setSelectedPost((current) =>
        current?._id === payload.postId
          ? {
              ...current,
              likes: payload.likes || current.likes,
            }
          : current
      );
    };

    const handleNewSave = (payload: { postId: string; savedBy?: string[] }) => {
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

      setSelectedPost((current) =>
        current?._id === payload.postId
          ? {
              ...current,
              savedBy: payload.savedBy || current.savedBy,
            }
          : current
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

      setSelectedPost((current) =>
        current?._id === payload.postId
          ? {
              ...current,
              commentsCount: (current.commentsCount || 0) + 1,
            }
          : current
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

      setSelectedPost((current) =>
        current?._id === payload.postId
          ? {
              ...current,
              commentsCount: Math.max((current.commentsCount || 0) - 1, 0),
            }
          : current
      );
    };

    const handlePostVisibilityChanged = (payload: {
      postId: string;
      visible: boolean;
      post?: Post;
    }) => {
      if (!payload.visible) {
        setPosts((current) =>
          current.filter((post) => post._id !== payload.postId)
        );

        setSelectedPost((current) =>
          current?._id === payload.postId ? null : current
        );

        return;
      }

      if (payload.post) {
        setPosts((current) => {
          const existed = current.some((post) => post._id === payload.postId);

          if (existed) {
            return current.map((post) =>
              post._id === payload.postId ? payload.post! : post
            );
          }

          return [payload.post!, ...current];
        });
      }
    };

    socket.on("new_post", handleNewPost);
    socket.on("post_updated", handlePostUpdated);
    socket.on("post_deleted", handlePostDeleted);
    socket.on("new_like", handleNewLike);
    socket.on("new_save", handleNewSave);
    socket.on("new_comment", handleNewComment);
    socket.on("comment_deleted", handleCommentDeleted);
    socket.on("post_visibility_changed", handlePostVisibilityChanged);

    return () => {
      socket.off("new_post", handleNewPost);
      socket.off("post_updated", handlePostUpdated);
      socket.off("post_deleted", handlePostDeleted);
      socket.off("new_like", handleNewLike);
      socket.off("new_save", handleNewSave);
      socket.off("new_comment", handleNewComment);
      socket.off("comment_deleted", handleCommentDeleted);
      socket.off("post_visibility_changed", handlePostVisibilityChanged);
    };
  }, []);

  const closePostModal = () => {
    setSelectedPost(null);
    setSelectedPostId(null);
    window.history.replaceState(null, "", "/feed");
  };

  const renderMedia = (post: Post, compact = false) => {
    const media = post.media?.[0];

    if (!media?.url) {
      return (
        <div className={`feed-post-placeholder ${compact ? "compact" : ""}`}>
          <FiImage />
          <span>No media</span>
        </div>
      );
    }

    const isVideo =
      media.type?.includes("video") ||
      Boolean(media.url.match(/\.(mp4|webm|ogg)$/i));

    if (isVideo) {
      return (
        <video
          controls
          preload="metadata"
          src={media.url}
          className={`feed-post-media ${compact ? "compact" : ""}`}
        />
      );
    }

    return (
      <img
        src={media.url}
        alt={post.title || "Post media"}
        className={`feed-post-media ${compact ? "compact" : ""}`}
        loading="lazy"
        decoding="async"
      />
    );
  };

  const renderPostCard = (post: Post, isHighlighted = false) => {
    const authorName =
      post.author?.username || post.authorName || "Unknown creator";

    const cardContent = (
      <article
        className={`feed-post-card ${isHighlighted ? "highlighted" : ""}`}
      >
        {renderMedia(post, isHighlighted)}

        <div className="feed-post-body">
          <div className="feed-post-author">
            {post.author?.avatar ? (
              <img
                src={post.author.avatar}
                alt={authorName}
                className="feed-author-avatar"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="feed-author-avatar placeholder">
                {authorName.charAt(0).toUpperCase()}
              </span>
            )}

            <div>
              <strong>{authorName}</strong>
              {post.createdAt && (
                <p>
                  <FiCalendar />
                  {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                </p>
              )}
            </div>
          </div>

          <h2>{post.title || "Untitled post"}</h2>

          {post.content && <p className="feed-post-content">{post.content}</p>}

          {post.tags?.length ? (
            <div className="feed-post-tags">
              {post.tags.map((tag) => (
                <span key={formatTagLabel(tag)}>
                  <FiTag />
                  {formatTagLabel(tag)}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    );
    if (isHighlighted) {
      return <div key={post._id}>{cardContent}</div>;
    }

    return (
      <Link
        key={post._id}
        href={`/posts/${post._id}`}
        className="feed-post-link"
      >
        {cardContent}
      </Link>
    );
  };

  return (
    <main className="feed-page">
      <div className="feed-header">
        <div>
          <p className="feed-kicker">Creative Feed</p>
          <h1>Explore Works</h1>
          <p>Xem các bài viết mới nhất từ cộng đồng sáng tạo.</p>
        </div>

        <Link href="/" className="feed-back-link">
          <FiArrowLeft />
          <span className="feed-back-text">Về trang chủ</span>
        </Link>
      </div>

      <section className="feed-list-section">
        <div className="feed-section-head">
          <div>
            <p className="feed-kicker small">Latest posts</p>
            <h2>Tất cả bài viết</h2>
          </div>
          <span>{posts.length} posts</span>
        </div>

        {loadingPosts ? (
          <div className="feed-skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div className="feed-skeleton-card" key={item}>
                <div />
                <span />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="feed-empty">
            <FiImage />
            <strong>Chưa có bài viết nào.</strong>
            <p>Hãy tạo bài viết đầu tiên để bắt đầu feed sáng tạo.</p>
          </div>
        ) : (
          <div className="feed-grid">
            {posts.map((post) => renderPostCard(post))}
          </div>
        )}
      </section>

      {selectedPostId && (
        <div className="post-modal-backdrop" onClick={closePostModal}>
          <div
            className="post-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="post-modal-header">
              <div>
                <p className="feed-kicker small">From notification</p>
                <h2>Bài viết</h2>
              </div>

              <button type="button" onClick={closePostModal} aria-label="Đóng">
                <FiX />
              </button>
            </div>

            {loadingSelectedPost ? (
              <p className="feed-muted modal-message">Đang tải bài viết...</p>
            ) : selectedPost ? (
              <div className="post-modal-content">
                {renderPostCard(selectedPost, true)}
              </div>
            ) : (
              <p className="feed-error modal-message">
                Không tìm thấy bài viết từ thông báo này.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
