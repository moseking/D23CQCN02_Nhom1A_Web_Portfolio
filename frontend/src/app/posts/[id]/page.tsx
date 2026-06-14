/* eslint-disable @next/next/no-img-element */

import { notFound } from "next/navigation";
import PostComments from "@/components/posts/PostComments";
import { FiStar } from "react-icons/fi";
import PostDetailActions from "@/components/posts/PostDetailActions";
import PostOwnerActions from "@/components/posts/PostOwnerActions";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type MediaItem = {
  url?: string;
  type?: string;
};

type PostDetail = {
  _id: string;
  title?: string;
  content?: string;
  authorName?: string;
  author?: {
    _id?: string;
    id?: string;
    username?: string;
    avatar?: string;
    bio?: string;
  };
  media?: MediaItem[];
  tags?: string[];
  createdAt?: string;
  likes?: string[];
  likedBy?: string[];
  savedBy?: string[];
  commentsCount?: number;
};

async function getPost(id: string): Promise<PostDetail | null> {
  const res = await fetch(`${API_URL}/posts/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  const json = await res.json();

  return json.data || null;
}

async function getRelatedPosts(post: PostDetail): Promise<PostDetail[]> {
  const firstTag = post.tags?.[0];

  const url = firstTag
    ? `${API_URL}/posts?limit=6&tag=${encodeURIComponent(firstTag)}`
    : `${API_URL}/posts?limit=6`;

  const res = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return [];
  }

  const json = await res.json();
  const posts = (json.data || []) as PostDetail[];

  return posts.filter((item) => item._id !== post._id).slice(0, 3);
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return {
      title: "Post not found | Artfolio",
    };
  }

  return {
    title: `${post.title || "Creative Post"} | Artfolio`,
    description:
      post.content?.slice(0, 150) || "A creative portfolio post on Artfolio.",
  };
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post);

  const authorId = post.author?._id || post.author?.id;
  const authorName =
    post.author?.username || post.authorName || "Unknown creator";
  const authorAvatar = post.author?.avatar;
  const authorHref = authorId ? `/users/${authorId}` : undefined;

  const media = post.media?.[0];
  const isVideo =
    media?.type?.includes("video") ||
    Boolean(media?.url?.match(/\.(mp4|webm|ogg|mov)$/i));

  return (
    <main className="min-h-screen bg-[#f7f8f3] text-[#252525]">
      <header className="sticky top-0 z-30 border-b border-[#e0e3da] bg-[#f7f8f3]/90 px-6 py-4 backdrop-blur-xl sm:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-3 font-sans text-[30px] font-semibold text-[#252525]"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#9caf88] text-white shadow-[0_10px_22px_rgba(72,84,55,0.22)]">
              <FiStar className="h-7 w-7" />
            </span>
            <span>Artfolio</span>
          </a>

          <div className="flex items-center gap-3">
            <a
              href="/notifications"
              className="rounded-full border border-[#d9e2d0] px-5 py-3 text-sm font-medium text-[#5f6d52] transition hover:bg-[#eef3e8]"
            >
              Thông báo
            </a>

            <a
              href="/"
              className="rounded-full border border-[#d9e2d0] px-5 py-3 text-sm font-medium text-[#5f6d52] transition hover:bg-[#eef3e8]"
            >
              Về trang chủ
            </a>

            <a
              href="/feed"
              className="rounded-full bg-[#252525] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#3a3a3a]"
            >
              Về feed
            </a>
          </div>
        </div>
      </header>

      <div className="px-6 py-10 sm:px-10">
        <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
          <article className="overflow-hidden rounded-[28px] border border-[#e1e6db] bg-white shadow-sm">
            {media?.url && (
              <div className="bg-slate-950">
                {isVideo ? (
                  <video
                    className="max-h-[620px] w-full object-contain"
                    controls
                    preload="metadata"
                    src={media.url}
                  />
                ) : (
                  <img
                    alt={post.title || "Post media"}
                    className="max-h-[620px] w-full object-cover"
                    src={media.url}
                  />
                )}
              </div>
            )}

            <div className="p-6 sm:p-10">
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                {post.title || "Untitled post"}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                {authorHref ? (
                  <a
                    href={authorHref}
                    className="inline-flex items-center gap-3 rounded-full bg-[#f0f4ec] px-3 py-2 text-sm font-semibold text-[#252525] transition hover:bg-[#e5eddd]"
                  >
                    {authorAvatar ? (
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#9caf88] text-white">
                        {authorName.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span>{authorName}</span>
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-3 rounded-full bg-[#f0f4ec] px-3 py-2 text-sm font-semibold text-[#252525]">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#9caf88] text-white">
                      {authorName.charAt(0).toUpperCase()}
                    </span>
                    <span>{authorName}</span>
                  </span>
                )}

                {post.createdAt && (
                  <span className="text-sm font-medium text-slate-500">
                    Ngày đăng:{" "}
                    {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                )}
              </div>
              {post.content && (
                <p className="mt-8 whitespace-pre-line text-lg leading-8 text-slate-700">
                  {post.content}
                </p>
              )}

              {post.tags?.length ? (
                <div className="mt-8 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#eef2ea] px-4 py-2 text-sm font-medium text-[#6f7e5b]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="post-detail-action-row">
                <PostDetailActions
                  postId={post._id}
                  likes={post.likes || []}
                  likedBy={post.likedBy || []}
                  savedBy={post.savedBy || []}
                  commentsCount={post.commentsCount || 0}
                />

                <PostOwnerActions
                  postId={post._id}
                  authorId={authorId}
                  authorName={authorName}
                />
              </div>
            </div>
          </article>

          <aside
            id="comments"
            className="scroll-mt-28 lg:sticky lg:top-6 lg:self-start"
          >
            <PostComments postId={post._id} />
          </aside>
        </section>

        {relatedPosts.length > 0 && (
          <section className="mx-auto mt-10 max-w-7xl">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7b8f68]">
                  Explore more
                </p>
                <h2 className="mt-1 text-3xl font-semibold">Bài viết khác</h2>
              </div>

              <a
                href="/feed"
                className="rounded-full border border-[#d8e2ce] bg-white px-5 py-3 text-sm font-medium text-[#5f6d54]"
              >
                Xem feed
              </a>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((item) => {
                const relatedMedia = item.media?.[0];
                const relatedIsVideo =
                  relatedMedia?.type?.includes("video") ||
                  Boolean(relatedMedia?.url?.match(/\.(mp4|webm|ogg|mov)$/i));

                return (
                  <a
                    key={item._id}
                    href={`/posts/${item._id}`}
                    className="overflow-hidden rounded-[24px] border border-[#e1e6db] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    {relatedMedia?.url ? (
                      relatedIsVideo ? (
                        <video
                          className="h-56 w-full bg-slate-950 object-cover"
                          muted
                          playsInline
                          preload="metadata"
                          src={relatedMedia.url}
                        />
                      ) : (
                        <img
                          alt={item.title || "Related post"}
                          className="h-56 w-full object-cover"
                          src={relatedMedia.url}
                        />
                      )
                    ) : (
                      <div className="flex h-56 items-center justify-center bg-[#eef2ea] text-[#6f7e5b]">
                        No media
                      </div>
                    )}

                    <div className="p-5">
                      <p className="text-sm font-medium text-[#7b8f68]">
                        {item.authorName || "Unknown creator"}
                      </p>

                      <h3 className="mt-2 text-xl font-semibold text-[#252525]">
                        {item.title || "Untitled post"}
                      </h3>

                      {item.content && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                          {item.content}
                        </p>
                      )}

                      {item.tags?.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-[#eef2ea] px-3 py-1 text-xs font-medium text-[#6f7e5b]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
