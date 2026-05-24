"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiBookmark,
  FiMessageCircle,
  FiCheck,
  FiEdit3,
  FiHeart,
  FiSearch,
  FiSend,
  FiStar,
  FiTrash2,
  FiUser,
  FiUserCheck,
  FiUserPlus,
} from "react-icons/fi";

import { useAuthStore } from "../store/authStore";
import { api } from "../lib/axios";

const categories = [
  "All",
  "UI/UX",
  "Branding",
  "Illustration",
  "Photography",
  "3D",
  "Motion",
];


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const DEFAULT_POST_IMAGE =
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80";

function getCurrentUserName() {
  if (typeof window === "undefined") return "nhuquynh";
  return localStorage.getItem("username") || "nhuquynh";
}

const works = [
  {
    title: "Mobile Banking App - Modern UI Design",
    author: "Trang",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
    image:
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80",
    tags: ["UI/UX", "Mobile", "Fintech"],
    likes: "2.4K",
    span: "wide",
  },
  {
    title: "Colorful Abstract Brand Identity",
    author: "An",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&q=80",
    image:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80",
    tags: ["Branding", "Abstract", "Colorful"],
    likes: "4.8K",
    span: "tall",
  },
  {
    title: "Health & Fitness Mobile Interface",
    author: "Minh",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
    tags: ["Health", "Mobile", "UI/UX"],
    likes: "1.8K",
  },
  {
    title: "Dark Modern Dashboard Design",
    author: "Vy",
    avatar:
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=160&q=80",
    image:
      "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80",
    tags: ["Dashboard", "Dark Mode", "Web"],
    likes: "3.1K",
  },
  {
    title: "Educational Platform - Learning App",
    author: "Linh",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    tags: ["Education", "UI/UX", "Mobile"],
    likes: "2.9K",
  },
  {
    title: "Birthday Branding - Colorful Design",
    author: "Huy",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80",
    image:
      "https://images.unsplash.com/photo-1516542076529-1ea3854896f2?auto=format&fit=crop&w=1200&q=80",
    tags: ["Branding", "Print", "Colorful"],
    likes: "5.7K",
  },
  {
    title: "Motion Poster Series",
    author: "Mai",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
    image:
      "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=1200&q=80",
    tags: ["Motion", "Poster", "3D"],
    likes: "2.2K",
  },
];

const creators = [
  {
    name: "Trang Nguyen",
    role: "UI/UX Designer",
    followers: "12.5K",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "An Tran",
    role: "Brand Designer",
    followers: "8.2K",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Minh Le",
    role: "Digital Artist",
    followers: "15.7K",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Vy Pham",
    role: "Product Designer",
    followers: "9.8K",
    avatar:
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Huy Nguyen",
    role: "Illustrator",
    followers: "11.3K",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Linh Vo",
    role: "Motion Designer",
    followers: "7.9K",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const [apiWorks, setApiWorks] = useState([]);
  const [creators, setCreators] = useState([]);
  const [feedStatus, setFeedStatus] = useState("loading");
  const [currentUserName, setCurrentUserName] = useState("nhuquynh");

  useEffect(() => {
    setCurrentUserName(getCurrentUserName());
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPosts() {
      try {
        const response = await fetch(`${API_URL}/api/posts?limit=20`, {
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Cannot load posts");
        }

        const posts = result.data.map((post) => ({
          id: post._id,
          title: post.title || post.caption || "Untitled Post",
          author: post.authorName || post.author?.username || "Creator",
          avatar: post.author?.avatar || DEFAULT_AVATAR,
          image: post.media?.[0]?.url || post.image || DEFAULT_POST_IMAGE,
          mediaType: post.media?.[0]?.type || "image",
          tags: post.tags?.length ? post.tags : ["Portfolio"],
          likes: post.likedBy?.length || post.likes?.length || 0,
          liked: post.likedBy?.includes(currentUserName.toLowerCase()) || false,
          saves: post.savedBy?.length || 0,
          saved: post.savedBy?.includes(currentUserName.toLowerCase()) || false,
          content: post.content || post.caption || "",
          isNew: true,
          comments: [],
        }));

        const postsWithComments = await Promise.all(
          posts.map(async (post) => {
            try {
              const commentResponse = await fetch(
                `${API_URL}/api/posts/${post.id}/comments`,
                {
                  signal: controller.signal,
                }
              );

              const commentResult = await commentResponse.json();

              return {
                ...post,
                comments:
                  commentResponse.ok && commentResult.success
                    ? commentResult.data.map((comment) => ({
                        id: comment._id,
                        authorName: comment.authorName,
                        content: comment.content,
                        createdAt: comment.createdAt,
                      }))
                    : [],
              };
            } catch {
              return post;
            }
          })
        );

        setApiWorks(postsWithComments);
        setFeedStatus("ready");
      } catch (error) {
        if (error.name !== "AbortError") {
          setFeedStatus("offline");
        }
      }
    }

    loadPosts();

    return () => controller.abort();
  }, [currentUserName]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCreators() {
      try {
        const response = await api.get("/auth/creators?limit=6", {
          signal: controller.signal,
        });

        if (response.data?.success) {
          setCreators(
            response.data.data.map((creator) => ({
              id: creator._id,
              name: creator.username,
              role: creator.bio || `${creator.postsCount} posts`,
              postsCount: creator.postsCount,
              followersCount: creator.followersCount || 0,
              isFollowing: creator.isFollowing || false,
              avatar: creator.avatar || DEFAULT_AVATAR,
            }))
          );
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setCreators([]);
        }
      }
    }

    loadCreators();
    return () => controller.abort();
  }, []);

  const filteredWorks = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const allWorks = [...apiWorks, ...works];

    return allWorks.filter((work) => {
      const matchesCategory =
        activeCategory === "All" ||
        work.tags.some((tag) =>
          tag.toLowerCase().includes(activeCategory.toLowerCase())
        );

      const matchesSearch =
        !keyword ||
        [work.title, work.author, work.content || "", ...work.tags].some(
          (item) => item.toLowerCase().includes(keyword)
        );

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, apiWorks, query]);

  const visibleWorks = filteredWorks.slice(0, visibleCount);

  const addCommentToPost = (postId, comment) => {
    setApiWorks((currentWorks) =>
      currentWorks.map((work) =>
        work.id === postId
          ? { ...work, comments: [comment, ...(work.comments || [])] }
          : work
      )
    );
  };

  const updatePostLike = (postId, likeData) => {
    setApiWorks((currentWorks) =>
      currentWorks.map((work) =>
        work.id === postId
          ? { ...work, likes: likeData.likesCount, liked: likeData.liked }
          : work
      )
    );
  };

  const updatePostSave = (postId, saveData) => {
    setApiWorks((currentWorks) =>
      currentWorks.map((work) =>
        work.id === postId
          ? { ...work, saves: saveData.savesCount, saved: saveData.saved }
          : work
      )
    );
  };

  const removePostFromFeed = (postId) => {
    setApiWorks((currentWorks) =>
      currentWorks.filter((work) => work.id !== postId)
    );
  };

  const updateCreatorFollow = (creatorId, followData) => {
    setCreators((currentCreators) =>
      currentCreators.map((creator) =>
        creator.id === creatorId
          ? {
              ...creator,
              isFollowing: followData.followed,
              followersCount: followData.followersCount,
            }
          : creator
      )
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f8f3] text-[#252525]">
      <Header query={query} setQuery={setQuery} />
      <Hero />

      <section
        className="mx-auto max-w-[1840px] px-6 py-20 sm:px-10 lg:px-12"
        id="explore"
      >
        <div className="reveal flex flex-col gap-5">
          <p className="eyebrow">Discover</p>

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h2 className="section-title">Creative Works</h2>
              <p className="mt-4 max-w-2xl text-xl text-slate-600">
                Explore thousands of projects from talented creators worldwide
              </p>
            </div>

            <a className="quiet-link" href="#creators">
              View trending creators <FiArrowRight />
            </a>
          </div>
        </div>

        <div className="reveal mt-12 flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              className={`chip ${
                activeCategory === category ? "chip-active" : ""
              }`}
              key={category}
              onClick={() => {
                setActiveCategory(category);
                setVisibleCount(6);
              }}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>

        <div className="feed-grid mt-12 grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
          {visibleWorks.map((work, index) => (
            <WorkCard
              index={index}
              key={work.id || work.title}
              onCommentCreated={addCommentToPost}
              onLikeUpdated={updatePostLike}
              onSaveUpdated={updatePostSave}
              onDeleted={removePostFromFeed}
              currentUserName={currentUserName}
              work={work}
            />
          ))}
        </div>

        {feedStatus === "offline" && (
          <p className="mt-8 text-center text-sm font-semibold text-[#8d6b3d]">
            Backend is not reachable, showing sample portfolio works.
          </p>
        )}

        {visibleWorks.length === 0 && (
          <div className="rounded-[8px] border border-dashed border-[#9caf88] py-16 text-center text-lg text-slate-500">
            No creative works match your search.
          </div>
        )}

        {visibleCount < filteredWorks.length && (
          <div className="reveal mt-14 flex justify-center">
            <button
              className="secondary-button"
              onClick={() => setVisibleCount((count) => count + 3)}
              type="button"
            >
              Load More Projects
            </button>
          </div>
        )}
      </section>

      <section
        className="border-y border-[#e0e3da] bg-white/55 px-6 py-20 sm:px-10 lg:px-12"
        id="creators"
      >
        <div className="mx-auto max-w-[1840px]">
          <div className="reveal flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="eyebrow">Community</p>
              <h2 className="section-title mt-3">Trending Creators</h2>
              <p className="mt-4 text-xl text-slate-600">
                Follow talented designers and get inspired by their work
              </p>
            </div>

            <a className="quiet-link" href="#explore">
              View all creators <FiArrowRight />
            </a>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
            {creators.map((creator, index) => (
              <CreatorCard
                creator={creator}
                index={index}
                key={creator.id || creator.name}
                onFollowUpdated={updateCreatorFollow}
              />
            ))}
          </div>

          {creators.length === 0 && (
            <p className="mt-8 text-center text-sm font-semibold text-slate-500">
              No creators yet.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Header({ query, setQuery }) {
  const [mounted, setMounted] = useState(false);
  const {
    user,
    isAuthenticated,
    logout,
  } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const username = user?.username || "";

  return (
    <header className="sticky top-0 z-30 border-b border-[#e0e3da] bg-[#f7f8f3]/88 px-6 py-5 shadow-[0_8px_30px_rgba(41,45,36,0.06)] backdrop-blur-xl sm:px-10 lg:px-12">
      <nav className="mx-auto flex max-w-[1840px] items-center gap-7">
        <a className="brand" href="#">
          <span className="brand-mark">
            <FiStar />
          </span>
          <span>Artfolio</span>
        </a>

        <div className="hidden items-center gap-8 text-lg text-slate-500 lg:flex">
          <a className="nav-link" href="#explore">
            Explore
          </a>
          <a className="nav-link" href="#creators">
            Trending
          </a>
          <a className="nav-link" href="#explore">
            Portfolio Styles
          </a>
          <a className="nav-link" href="/create-post">
            Create Post
          </a>
          <a className="nav-link" href="/search">
            Search
          </a>
          <a className="nav-link" href="/notifications">
            Notifications
          </a>
        </div>

        <label className="search-bar">
          <FiSearch />
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for creative work..."
            type="search"
            value={query}
          />
        </label>

        <div className="ml-auto hidden min-h-[44px] items-center gap-5 text-lg lg:flex">
          {!mounted ? (
            <div aria-hidden="true" className="h-11 w-[170px]" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-4">
              <button
                className="text-slate-500 transition hover:text-red-500"
                onClick={logout}
                type="button"
              >
                Logout
              </button>

              <span className="font-bold text-[#76875f]">
                {username}
              </span>
            </div>
          ) : (
            <>
              <a
                className="text-slate-500 transition hover:text-[#76875f]"
                href="/auth?mode=login"
              >
                Login
              </a>

              <a
                className="primary-button"
                href="/auth?mode=register"
              >
                Sign Up
              </a>
            </>
          )}
        </div>

        <button
          aria-label="Open profile"
          className="icon-button"
          type="button"
        >
          <FiUser />
        </button>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero relative overflow-hidden border-b border-[#e0e3da] px-6 py-20 sm:px-10 lg:px-12 lg:py-28">
      <div className="hero-glow" />

      <div className="mx-auto grid max-w-[1840px] items-center gap-12 lg:grid-cols-[260px_minmax(520px,1fr)_300px] xl:grid-cols-[320px_minmax(650px,1fr)_360px]">
        <div className="floating-art hidden lg:block">
          <img
            alt="Mobile portfolio interface"
            src="https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=900&q=80"
          />
        </div>

        <div className="reveal text-center">
          <p className="eyebrow">Creative Portfolio Platform</p>
          <h1 className="hero-title">
            Showcase Your <span>Creative Identity</span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-2xl leading-relaxed text-slate-600">
            Discover UI/UX, Branding, Illustration & Digital Art from creators
            around the world
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <a className="primary-button large" href="#explore">
              Start Creating
            </a>
            <a className="outline-button large" href="#explore">
              Explore Works
            </a>
          </div>

          <div className="stats mt-14">
            <span>
              <strong>12,400+</strong> Creators
            </span>
            <span>
              <strong>48K+</strong> Projects
            </span>
            <span>
              <strong>180</strong> Countries
            </span>
          </div>
        </div>

        <div className="floating-stack hidden lg:block">
          <img
            alt="Colorful abstract portfolio artwork"
            className="stack-back"
            src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=900&q=80"
          />
          <img
            alt="Gallery wall with design prints"
            className="stack-front"
            src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80"
          />
        </div>
      </div>
    </section>
  );
}

function WorkCard({
  work,
  index,
  onCommentCreated,
  onLikeUpdated,
  onSaveUpdated,
  onDeleted,
  currentUserName,
}) {
  const {
    isAuthenticated,
  } = useAuthStore();
  const [likeError, setLikeError] = useState("");
  const [actionError, setActionError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner =
    work.id &&
    work.author?.trim().toLowerCase() === currentUserName.toLowerCase();

  const handleLike = async () => {
    setLikeError("");

    if (!work.id) {
      setLikeError("Only saved posts can be liked.");
      return;
    }

    if (!isAuthenticated) {
      setLikeError("Please login to like posts.");
      return;
    }

    try {
      const response = await api.post(`/posts/${work.id}/like`);
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Like failed");
      }

      onLikeUpdated(work.id, result.data);
    } catch (requestError) {
      setLikeError(requestError.message);
    }
  };

  const handleSave = async () => {
    setActionError("");

    if (!work.id) {
      setActionError("Only saved posts can be bookmarked.");
      return;
    }

    if (!isAuthenticated) {
      setActionError("Please login to save posts.");
      return;
    }

    try {
      const response = await api.post(`/posts/${work.id}/save`);
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Save failed");
      }

      onSaveUpdated(work.id, result.data);
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  const handleDelete = async () => {
    setActionError("");

    if (!work.id || !isOwner) {
      setActionError("You can only delete posts created by your account.");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await api.delete(`/posts/${work.id}`);
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Delete failed");
      }

      onDeleted(work.id);
    } catch (requestError) {
      setActionError(requestError.message);
      setIsDeleting(false);
    }
  };

  return (
    <article
      className={`work-card reveal ${
        work.span === "tall" ? "lg:row-span-2" : ""
      }`}
      style={{ "--delay": `${index * 90}ms` }}
    >
      <a className="work-image" href="#">
        {work.mediaType === "video" ? (
          <video controls src={work.image} />
        ) : (
          <img alt={work.title} src={work.image} />
        )}
      </a>

      <div className="mt-5 flex items-center gap-3">
        <img alt={work.author} className="avatar" src={work.avatar} />
        <span className="text-lg font-semibold">{work.author}</span>
      </div>

      <div className="work-actions">
        <button
          aria-label={work.saved ? "Unsave post" : "Save post"}
          className={`save-action ${work.saved ? "saved" : ""}`}
          onClick={handleSave}
          type="button"
        >
          <FiBookmark /> <span>{work.saves || 0}</span>
        </button>

        {work.id && (
          <a
            aria-label="Edit post"
            className="edit-action"
            href={`/edit-post/${work.id}`}
          >
            <FiEdit3 />
          </a>
        )}

        {isOwner && (
          <button
            aria-label="Delete post"
            className="delete-action"
            onClick={() => setShowDeleteModal(true)}
            type="button"
          >
            <FiTrash2 />
          </button>
        )}

        <button
          aria-label={work.liked ? "Unlike post" : "Like post"}
          className={`like-action ${work.liked ? "liked" : ""}`}
          onClick={handleLike}
          type="button"
        >
          <FiHeart /> <span>{work.likes}</span>
        </button>
      </div>

      {(likeError || actionError) && (
        <p className="comment-error">{likeError || actionError}</p>
      )}

      <h3 className="mt-3 work-title">{work.title}</h3>

      {work.content && (
        <p className="mt-2 line-clamp-2 text-slate-600">{work.content}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {work.isNew && <span className="tag new-tag">New Post</span>}

        {work.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>

      <CommentSection onCommentCreated={onCommentCreated} work={work} />

      {showDeleteModal && (
        <div
          className="delete-modal-backdrop fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
          role="presentation"
        >
          <div
            aria-modal="true"
            className="delete-modal w-full max-w-md rounded-[8px] border border-red-100 bg-[#fffdf8] p-6 text-center shadow-[0_28px_80px_rgba(31,41,55,0.28)]"
            role="dialog"
          >
            <div className="delete-modal-icon mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600">
              <FiTrash2 />
            </div>

            <h4 className="mt-4 font-serif text-3xl font-bold text-[#252525]">
              Delete this post?
            </h4>

            <p className="mx-auto mt-3 max-w-sm text-base leading-7 text-slate-500">
              This post will be removed from your feed. Comments, likes, and
              saved state attached to it will disappear too.
            </p>

            <div className="delete-modal-actions mt-6 grid grid-cols-2 gap-3">
              <button
                className="modal-cancel rounded-full bg-[#eef2ea] px-5 py-3 font-bold text-[#5f6d52] transition hover:-translate-y-0.5 disabled:opacity-60"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                type="button"
              >
                Cancel
              </button>

              <button
                className="modal-delete rounded-full bg-red-600 px-5 py-3 font-bold text-white shadow-lg shadow-red-900/10 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:opacity-60"
                disabled={isDeleting}
                onClick={handleDelete}
                type="button"
              >
                {isDeleting ? "Deleting..." : "Delete Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function getCurrentCommentAuthor() {
  if (typeof window === "undefined") return "nhuquynh";
  return localStorage.getItem("username") || "nhuquynh";
}

function CommentSection({ work, onCommentCreated }) {
  const {
    user,
    isAuthenticated,
  } = useAuthStore();
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("nhuquynh");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const comments = work.comments || [];

  useEffect(() => {
    setAuthorName(user?.username || getCurrentCommentAuthor());
  }, [user?.username]);

  const submitComment = async (event) => {
    event.preventDefault();
    setError("");

    if (!work.id) {
      setError("Only saved posts can receive comments.");
      return;
    }

    if (!isAuthenticated) {
      setError("Please login to comment.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post(
        `/posts/${work.id}/comments`,
        {
          content: content.trim(),
        }
      );
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Create comment failed");
      }

      onCommentCreated(work.id, {
        id: result.data._id,
        authorName: result.data.authorName,
        content: result.data.content,
        createdAt: result.data.createdAt,
      });

      setContent("");
      setIsOpen(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={`comment-box ${isOpen ? "comment-box-open" : ""}`}>
      <button
        aria-expanded={isOpen}
        className="comment-trigger"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span>
          <FiMessageCircle />
          <strong>{comments.length}</strong>
        </span>
        <em>{comments.length === 1 ? "comment" : "comments"}</em>
      </button>

      {isOpen && (
        <div className="comment-panel">
          <div className="comment-list">
            {comments.slice(0, 3).map((comment) => (
              <article className="comment-item" key={comment.id}>
                <strong>{comment.authorName}</strong>
                <p>{comment.content}</p>
              </article>
            ))}

            {comments.length === 0 && (
              <p className="comment-empty">Be the first to comment.</p>
            )}
          </div>

          <form className="comment-form" onSubmit={submitComment}>
            <input
              onChange={(event) => setAuthorName(event.target.value)}
              placeholder="Author"
              readOnly
              type="text"
              value={authorName}
            />

            <div>
              <input
                disabled={!work.id}
                onChange={(event) => setContent(event.target.value)}
                placeholder={
                  work.id
                    ? "Write a comment..."
                    : "Comments are enabled for saved posts"
                }
                required
                type="text"
                value={content}
              />

              <button disabled={isSubmitting || !work.id} type="submit">
                <FiSend />
              </button>
            </div>
          </form>

          {error && <p className="comment-error">{error}</p>}
        </div>
      )}
    </section>
  );
}

function CreatorCard({ creator, index, onFollowUpdated }) {
  const { isAuthenticated } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const handleFollow = async () => {
    setError("");

    if (!isAuthenticated) {
      setError("Please login to follow creators.");
      return;
    }

    if (!creator.id) {
      setError("Creator account is not available.");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await api.post(`/auth/users/${creator.id}/follow`);
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Follow failed");
      }

      onFollowUpdated(creator.id, result.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <article
      className="creator-card reveal"
      style={{ "--delay": `${index * 80}ms` }}
    >
      <div className="flex items-center gap-5">
        <span className="relative">
          <img alt={creator.name} className="creator-avatar" src={creator.avatar} />
          <span className="verified">
            <FiCheck />
          </span>
        </span>

        <div>
          <h3 className="creator-name">{creator.name}</h3>
          <p className="text-lg text-slate-600">{creator.role}</p>
        </div>
      </div>

      <div className="mt-8 flex items-end justify-between border-t border-[#dfe3d9] pt-6">
        <div className="flex gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.14em] text-slate-500">Posts</p>
            <p className="mt-2 text-2xl font-semibold">{creator.postsCount || 0}</p>
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.14em] text-slate-500">Followers</p>
            <p className="mt-2 text-2xl font-semibold">{creator.followersCount || 0}</p>
          </div>
        </div>

        <button className="follow-button" disabled={isUpdating} onClick={handleFollow} type="button">
          {creator.isFollowing ? <FiUserCheck /> : <FiUserPlus />}
          {isUpdating ? "..." : creator.isFollowing ? "Following" : "Follow"}
        </button>
      </div>

      {error && <p className="comment-error mt-4">{error}</p>}
    </article>
  );
}

function Footer() {
  return (
    <footer className="bg-[#2b2b2b] px-6 py-20 text-center text-slate-400 sm:px-10 lg:px-12">
      <a className="brand footer-brand justify-center" href="#">
        <span className="brand-mark">
          <FiStar />
        </span>
        <span>Artfolio</span>
      </a>

      <p className="mx-auto mt-8 max-w-xl text-xl leading-relaxed">
        The creative portfolio platform for designers, artists, and creators
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-8 text-lg">
        {["About", "Careers", "Blog", "Privacy", "Terms"].map((item) => (
          <a className="transition hover:text-white" href="#" key={item}>
            {item}
          </a>
        ))}
      </div>

      <p className="mt-10 text-lg">© 2026 Artfolio. All rights reserved.</p>
    </footer>
  );
}
