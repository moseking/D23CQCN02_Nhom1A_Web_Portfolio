"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/axios";
import { socket } from "@/lib/socket";

type SearchUser = {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
  followers?: string[];
};

type SearchPost = {
  _id: string;
  title: string;
  content?: string;
  tags?: string[];
  authorName?: string;
  image?: string;
  media?: Array<{
    url?: string;
    type?: string;
  }>;
  likes?: string[];
  savedBy?: string[];
  commentsCount?: number;
  createdAt?: string;
};

function isVideoMedia(url?: string, type?: string) {
  return (
    type?.includes("video") ||
    url?.includes("/video/upload/") ||
    Boolean(url?.match(/\.(mp4|webm|ogg|mov)$/i))
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(false);
  const queryRef = useRef("");
  const typeRef = useRef("");

  useEffect(() => {
    queryRef.current = query.trim().toLowerCase();
    typeRef.current = type;
  }, [query, type]);

  useEffect(() => {
    const keyword = query.trim();

    if (!keyword) {
      setUsers([]);
      setPosts([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await api.get("/search", {
          params: {
            q: keyword,
            type: type || undefined,
          },
        });

        const data = res.data.data || res.data;

        setUsers(data.users || []);
        setPosts(data.posts || []);
      } catch (error) {
        console.log("Search error:", error);
        setUsers([]);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [query, type]);

  useEffect(() => {
    const postMatchesSearch = (post: SearchPost) => {
      const keyword = queryRef.current;

      if (!keyword) return false;
      if (typeRef.current === "user") return false;

      return [
        post.title || "",
        post.content || "",
        post.authorName || "",
        ...(post.tags || []),
      ].some((item) => item.toLowerCase().includes(keyword));
    };

    const handleNewPost = (payload: { post: SearchPost }) => {
      if (!postMatchesSearch(payload.post)) return;

      setPosts((current) => {
        const existed = current.some((post) => post._id === payload.post._id);
        if (existed) return current;
        return [payload.post, ...current];
      });
    };

    const handlePostUpdated = (payload: { post: SearchPost }) => {
      const matches = postMatchesSearch(payload.post);

      setPosts((current) => {
        const existed = current.some((post) => post._id === payload.post._id);

        if (!matches) {
          return current.filter((post) => post._id !== payload.post._id);
        }

        if (existed) {
          return current.map((post) =>
            post._id === payload.post._id
              ? {
                  ...post,
                  ...payload.post,
                }
              : post
          );
        }

        return [payload.post, ...current];
      });
    };

    const handlePostDeleted = (payload: { postId: string }) => {
      setPosts((current) =>
        current.filter((post) => post._id !== payload.postId)
      );
    };

    const handleNewLike = (payload: {
      postId: string;
      likes?: string[];
      likesCount?: number;
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

    socket.on("new_post", handleNewPost);
    socket.on("post_updated", handlePostUpdated);
    socket.on("post_deleted", handlePostDeleted);
    socket.on("new_like", handleNewLike);
    socket.on("new_comment", handleNewComment);
    socket.on("comment_deleted", handleCommentDeleted);

    return () => {
      socket.off("new_post", handleNewPost);
      socket.off("post_updated", handlePostUpdated);
      socket.off("post_deleted", handlePostDeleted);
      socket.off("new_like", handleNewLike);
      socket.off("new_comment", handleNewComment);
      socket.off("comment_deleted", handleCommentDeleted);
    };
  }, []);

  const showUsers = !type || type === "user";
  const showPosts = !type || type === "post";

  return (
    <main className="search-page min-h-screen bg-[#f7f8f3] px-6 py-28 text-[#252525]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="search-kicker mb-2 text-xs font-black uppercase text-[#91a37d]">
            Search System
          </p>
          <h1 className="text-4xl font-bold sm:text-6xl">Tìm kiếm nội dung</h1>
          <p className="mt-3 text-slate-500">
            Tìm bài viết theo tiêu đề, nội dung, tag hoặc tìm creator theo tên.
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-3 rounded-3xl border border-[#e1e6db] bg-white p-4 shadow-sm sm:flex-row">
          <input
            type="text"
            placeholder="Nhập từ khoá: ui/ux, portfolio, tên user..."
            className="min-h-12 flex-1 rounded-2xl bg-[#f1f3ee] px-4 outline-none focus:ring-2 focus:ring-[#9caf88]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="min-h-12 rounded-2xl bg-[#f1f3ee] px-4 font-bold text-[#6f7e5b] outline-none"
          >
            <option value="">All</option>
            <option value="user">Users</option>
            <option value="post">Posts</option>
          </select>
        </div>

        {loading && (
          <div className="grid gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-3xl bg-white shadow-sm"
              />
            ))}
          </div>
        )}

        {!loading && query.trim() && (
          <div className="grid gap-8">
            {showUsers && (
              <section>
                <h2 className="mb-4 text-2xl font-black">Users</h2>

                {users.length === 0 ? (
                  <p className="rounded-2xl bg-white p-5 text-sm text-slate-500">
                    Không tìm thấy user phù hợp.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {users.map((user) => (
                      <Link
                        key={user._id}
                        href={`/users/${user._id}`}
                        className="flex gap-4 rounded-3xl border border-[#e1e6db] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                      >
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="h-14 w-14 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#91a37d] text-xl font-bold text-white">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <h3 className="font-bold">{user.username}</h3>
                          {user.bio && (
                            <p className="mt-1 line-clamp-2 text-xl text-slate-500">
                              {user.bio}
                            </p>
                          )}
                          <p className="mt-2 text-sm font-bold text-[#6f7e5b]">
                            {user.followers?.length || 0} followers
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

            {showPosts && (
              <section>
                <h2 className="mb-4 text-2xl font-black">Posts</h2>

                {posts.length === 0 ? (
                  <p className="rounded-2xl bg-white p-5 text-xl text-slate-500">
                    Không tìm thấy bài viết phù hợp.
                  </p>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => {
                      const media = post.media?.[0];
                      const mediaUrl = media?.url || post.image;
                      const isVideo = isVideoMedia(mediaUrl, media?.type);

                      return (
                        <article
                          key={post._id}
                          className="overflow-hidden rounded-3xl border border-[#e1e6db] bg-white shadow-sm"
                        >
                          {mediaUrl &&
                            (isVideo ? (
                              <video
                                src={mediaUrl}
                                controls
                                preload="metadata"
                                className="h-52 w-full bg-slate-950 object-contain"
                              />
                            ) : (
                              <img
                                src={mediaUrl}
                                alt={post.title}
                                className="h-52 w-full object-cover"
                                loading="lazy"
                                decoding="async"
                              />
                            ))}

                          <div className="p-5">
                            <p className="mb-2 text-l font-bold text-[#91a37d]">
                              {post.authorName || "Unknown creator"}
                            </p>

                            <h3 className="text-xl font-bold">{post.title}</h3>

                            {post.content && (
                              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                                {post.content}
                              </p>
                            )}

                            {post.tags?.length ? (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {post.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-[#eef2ea] px-3 py-1 text-xs font-bold text-[#6f7e5b]"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {!loading && !query.trim() && (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
            Nhập từ khoá để bắt đầu tìm kiếm.
          </div>
        )}
      </div>
    </main>
  );
}
