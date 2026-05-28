"use client";

/* eslint-disable @next/next/no-img-element */

import {
  type CSSProperties,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FiArrowRight,
  FiBell,
  FiBookmark,
  FiMessageCircle,
  FiCheck,
  FiEdit3,
  FiHeart,
  FiLogOut,
  FiSearch,
  FiSend,
  FiStar,
  FiTrash2,
  FiUser,
  FiUserCheck,
  FiUserPlus,
  FiX,
  FiTag,
  FiCalendar,
  FiGrid,
} from "react-icons/fi";

import { useAuthStore } from "../store/authStore";
import { api } from "../lib/axios";
import { socket } from "../lib/socket";
import { createPortal } from "react-dom";
import LoadingSkeleton from "@/components/LoadingSkeleton";

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

type CommentItem = {
  id: string;
  authorName: string;
  content: string;
  createdAt?: string;
};

type FeedWork = {
  id?: string;
  authorId?: string;
  title: string;
  author: string;
  avatar: string;
  image: string;
  mediaType?: string;
  tags: string[];
  likes: string | number;
  span?: string;
  liked?: boolean;
  saves?: number;
  saved?: boolean;
  content?: string;
  isNew?: boolean;
  comments?: CommentItem[];
};

type Creator = {
  id?: string;
  name: string;
  role: string;
  avatar: string;
  postsCount?: number;
  followersCount?: number;
  isFollowing?: boolean;
};

type ApiPost = {
  _id: string;
  title?: string;
  caption?: string;
  content?: string;
  authorName?: string;
  author?: {
    _id?: string;
    id?: string;
    username?: string;
    avatar?: string;
  };
  authorId?: string;
  media?: Array<{
    url?: string;
    type?: "image" | "video";
  }>;
  image?: string;
  tags?: string[];
  likedBy?: string[];
  likes?: string[];
  savedBy?: string[];
};

type ApiComment = {
  _id: string;
  authorName: string;
  content: string;
  createdAt?: string;
};

type ApiCreator = {
  _id: string;
  username: string;
  bio?: string;
  postsCount?: number;
  followersCount?: number;
  isFollowing?: boolean;
  avatar?: string;
};

type LikeData = {
  likesCount: number;
  liked: boolean;
};

type SaveData = {
  savesCount: number;
  saved: boolean;
};

type FollowData = {
  followed: boolean;
  followersCount: number;
};

type StyleWithDelay = CSSProperties & {
  "--delay"?: string;
};

type RequestError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

function getRequestErrorMessage(error: unknown) {
  const requestError = error as RequestError;
  return requestError.response?.data?.message || getErrorMessage(error);
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function getCurrentUserName() {
  if (typeof window === "undefined") return "nhuquynh";
  return localStorage.getItem("username") || "nhuquynh";
}

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

const works: FeedWork[] = [
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

export default function Home() {
  const authUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [pauseInfiniteScroll, setPauseInfiniteScroll] = useState(false);
  const pauseInfiniteScrollRef = useRef(false);
  const resumeInfiniteScrollTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [apiWorks, setApiWorks] = useState<FeedWork[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [feedStatus, setFeedStatus] = useState("loading");
  const [currentUserName, setCurrentUserName] = useState("");
  const [previewPost, setPreviewPost] = useState<ModalPost | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const mapPostToWork = (post: ApiPost): FeedWork => ({
    id: post._id,
    authorId: post.author?._id || post.author?.id || post.authorId,
    title: post.title || post.caption || "Untitled Post",
    author: post.authorName || post.author?.username || "Creator",
    avatar: post.author?.avatar || DEFAULT_AVATAR,
    image: post.media?.[0]?.url || post.image || DEFAULT_POST_IMAGE,
    mediaType: isVideoMedia(
      post.media?.[0]?.url || post.image,
      post.media?.[0]?.type
    )
      ? "video"
      : "image",
    tags: post.tags?.length ? post.tags : ["Portfolio"],
    likes: post.likedBy?.length || post.likes?.length || 0,
    liked: post.likedBy?.includes(currentUserName.toLowerCase()) || false,
    saves: post.savedBy?.length || 0,
    saved: post.savedBy?.includes(currentUserName.toLowerCase()) || false,
    content: post.content || post.caption || "",
    isNew: true,
    comments: [],
  });

  useEffect(() => {
    setCurrentUserName(
      isAuthenticated ? authUser?.username || getCurrentUserName() : ""
    );
  }, [authUser?.username, isAuthenticated]);

  useEffect(() => {
    return () => {
      if (resumeInfiniteScrollTimerRef.current) {
        clearTimeout(resumeInfiniteScrollTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handlePostUpdated = (payload: { post: ApiPost }) => {
      const updatedWork = mapPostToWork(payload.post);

      setApiWorks((currentWorks) =>
        currentWorks.map((work) =>
          work.id === updatedWork.id
            ? {
                ...work,
                ...updatedWork,
                comments: work.comments || [],
              }
            : work
        )
      );
    };

    socket.on("post_updated", handlePostUpdated);

    return () => {
      socket.off("post_updated", handlePostUpdated);
    };
  }, [currentUserName]);

  useEffect(() => {
    const handleNewComment = (payload: {
      postId: string;
      comment: {
        _id?: string;
        id?: string;
        content?: string;
        authorName?: string;
        author?: {
          username?: string;
          avatar?: string;
        };
        createdAt?: string;
      };
    }) => {
      const normalizedComment: CommentItem = {
        id: payload.comment._id || payload.comment.id || `${Date.now()}`,
        authorName:
          payload.comment.author?.username ||
          payload.comment.authorName ||
          "Unknown user",
        content: payload.comment.content || "",
        createdAt: payload.comment.createdAt,
      };

      setApiWorks((currentWorks) =>
        currentWorks.map((work) => {
          if (work.id !== payload.postId) return work;

          const existed = work.comments?.some(
            (comment) => comment.id === normalizedComment.id
          );

          if (existed) return work;

          return {
            ...work,
            comments: [normalizedComment, ...(work.comments || [])],
          };
        })
      );
    };

    socket.on("new_comment", handleNewComment);

    return () => {
      socket.off("new_comment", handleNewComment);
    };
  }, []);

  useEffect(() => {
    const handleNewLike = (payload: {
      postId: string;
      likesCount: number;
      likes?: string[];
    }) => {
      setApiWorks((currentWorks) =>
        currentWorks.map((work) =>
          work.id === payload.postId
            ? {
                ...work,
                likes: payload.likesCount,
              }
            : work
        )
      );
    };

    socket.on("new_like", handleNewLike);

    return () => {
      socket.off("new_like", handleNewLike);
    };
  }, []);

  useEffect(() => {
    const handleCommentDeleted = (payload: {
      postId: string;
      commentId: string;
    }) => {
      setApiWorks((currentWorks) =>
        currentWorks.map((work) =>
          work.id === payload.postId
            ? {
                ...work,
                comments: (work.comments || []).filter(
                  (comment) => comment.id !== payload.commentId
                ),
              }
            : work
        )
      );
    };

    socket.on("comment_deleted", handleCommentDeleted);

    return () => {
      socket.off("comment_deleted", handleCommentDeleted);
    };
  }, []);

  useEffect(() => {
    const handleNewSave = (payload: { postId: string; savesCount: number }) => {
      setApiWorks((currentWorks) =>
        currentWorks.map((work) =>
          work.id === payload.postId
            ? {
                ...work,
                saves: payload.savesCount,
              }
            : work
        )
      );
    };

    socket.on("new_save", handleNewSave);

    return () => {
      socket.off("new_save", handleNewSave);
    };
  }, []);

  useEffect(() => {
    const handleRealtimeFollow = (payload: {
      targetUserId: string;
      followersCount: number;
      followed: boolean;
    }) => {
      setCreators((currentCreators) =>
        currentCreators.map((creator) => {
          if (creator.id !== payload.targetUserId) {
            return creator;
          }

          return {
            ...creator,
            followersCount: payload.followersCount,
            isFollowing: payload.followed,
          };
        })
      );
    };

    socket.on("new_follow_realtime", handleRealtimeFollow);

    return () => {
      socket.off("new_follow_realtime", handleRealtimeFollow);
    };
  }, []);

  useEffect(() => {
    const handleNewPost = (payload: { post: ApiPost }) => {
      const newWork = mapPostToWork(payload.post);

      setApiWorks((currentWorks) => {
        const existed = currentWorks.some((work) => work.id === newWork.id);

        if (existed) return currentWorks;

        return [newWork, ...currentWorks];
      });
    };

    socket.on("new_post", handleNewPost);

    return () => {
      socket.off("new_post", handleNewPost);
    };
  }, [currentUserName]);

  useEffect(() => {
    const handlePostDeleted = (payload: { postId: string }) => {
      setApiWorks((currentWorks) =>
        currentWorks.filter((work) => work.id !== payload.postId)
      );
    };

    socket.on("post_deleted", handlePostDeleted);

    return () => {
      socket.off("post_deleted", handlePostDeleted);
    };
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

        const posts = (result.data as ApiPost[]).map(mapPostToWork);

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
                    ? (commentResult.data as ApiComment[]).map((comment) => ({
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
        if (!isAbortError(error)) {
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
            (response.data.data as ApiCreator[]).map((creator) => ({
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
        if (!isAbortError(error)) {
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
      const tags = work.tags || [];

      const matchesCategory =
        activeCategory === "All" ||
        tags.some((tag) =>
          tag.toLowerCase().includes(activeCategory.toLowerCase())
        );

      const matchesSearch =
        !keyword ||
        [work.title || "", work.author || "", work.content || "", ...tags].some(
          (item) => item.toLowerCase().includes(keyword)
        );

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, apiWorks, works, query]);

  const visibleWorks = filteredWorks.slice(0, visibleCount);

  useEffect(() => {
    if (pauseInfiniteScroll) return;

    const target = loadMoreRef.current;

    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (!firstEntry.isIntersecting || pauseInfiniteScrollRef.current)
          return;

        setVisibleCount((current) => {
          if (current >= filteredWorks.length) return current;
          return Math.min(current + 3, filteredWorks.length);
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.2,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [filteredWorks.length, pauseInfiniteScroll]);

  const searchSuggestions = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return {
        works: [],
        creators: [],
      };
    }

    const matchedWorks = filteredWorks.slice(0, 5);

    const matchedCreators = creators
      .filter((creator) =>
        [creator.name || "", creator.role || ""].some((item) =>
          item.toLowerCase().includes(keyword)
        )
      )
      .slice(0, 4);

    return {
      works: matchedWorks,
      creators: matchedCreators,
    };
  }, [query, filteredWorks, creators]);

  const scrollToWorks = () => {
    document.getElementById("works-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToCreators = () => {
    pauseInfiniteScrollRef.current = true;
    setPauseInfiniteScroll(true);

    if (resumeInfiniteScrollTimerRef.current) {
      clearTimeout(resumeInfiniteScrollTimerRef.current);
    }

    requestAnimationFrame(() => {
      const creatorsSection = document.getElementById("creators");

      if (!creatorsSection) return;

      const headerOffset = 110;
      const targetTop =
        creatorsSection.getBoundingClientRect().top +
        window.scrollY -
        headerOffset;

      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
    });

    resumeInfiniteScrollTimerRef.current = setTimeout(() => {
      pauseInfiniteScrollRef.current = false;
      setPauseInfiniteScroll(false);
    }, 1800);
  };

  const handleSelectSearchSuggestion = () => {
    scrollToWorks();
  };

  const addCommentToPost = (postId: string, comment: CommentItem) => {
    setApiWorks((currentWorks) =>
      currentWorks.map((work) => {
        if (work.id !== postId) return work;

        const existed = (work.comments || []).some(
          (item) => item.id === comment.id
        );

        if (existed) return work;

        return {
          ...work,
          comments: [comment, ...(work.comments || [])],
        };
      })
    );
  };

  const deleteCommentFromPost = (postId: string, commentId: string) => {
    setApiWorks((currentWorks) =>
      currentWorks.map((work) =>
        work.id === postId
          ? {
              ...work,
              comments: (work.comments || []).filter(
                (comment) => comment.id !== commentId
              ),
            }
          : work
      )
    );
  };

  const updatePostLike = (postId: string, likeData: LikeData) => {
    setApiWorks((currentWorks) =>
      currentWorks.map((work) =>
        work.id === postId
          ? { ...work, likes: likeData.likesCount, liked: likeData.liked }
          : work
      )
    );
  };

  const updatePostSave = (postId: string, saveData: SaveData) => {
    setApiWorks((currentWorks) =>
      currentWorks.map((work) =>
        work.id === postId
          ? { ...work, saves: saveData.savesCount, saved: saveData.saved }
          : work
      )
    );
  };

  const removePostFromFeed = (postId: string) => {
    setApiWorks((currentWorks) =>
      currentWorks.filter((work) => work.id !== postId)
    );
  };

  const updateCreatorFollow = (creatorId: string, followData: FollowData) => {
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

  const openPostPreview = async (postId?: string) => {
    if (!postId) return;

    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewPost(null);

    try {
      const [postResponse, commentsResponse] = await Promise.all([
        api.get(`/posts/${postId}`),
        api.get(`/posts/${postId}/comments`),
      ]);

      const postData =
        postResponse.data.data || postResponse.data.post || postResponse.data;

      const commentsData = commentsResponse.data.data || [];

      setPreviewPost({
        ...postData,
        comments: commentsData,
        commentsCount: commentsData.length,
      });
    } catch (error) {
      console.log("Open post preview error:", error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePostPreview = () => {
    setPreviewOpen(false);
    setPreviewPost(null);
  };

  return (
    <main className="min-h-screen bg-[#f7f8f3] text-[#252525]">
      <Header
        query={query}
        setQuery={setQuery}
        searchSuggestions={searchSuggestions}
        scrollToWorks={scrollToWorks}
        scrollToCreators={scrollToCreators}
        handleSelectSearchSuggestion={handleSelectSearchSuggestion}
        openPostPreview={openPostPreview}
      />
      <Hero scrollToWorks={scrollToWorks} />

      <section
        id="works-section"
        className="mx-auto max-w-[1840px] px-6 py-20 sm:px-10 lg:px-12"
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

            <button
              className="quiet-link"
              onClick={scrollToCreators}
              type="button"
            >
              View trending creators <FiArrowRight />
            </button>
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

        {feedStatus === "loading" ? (
          <div className="mt-12">
            <LoadingSkeleton />
          </div>
        ) : (
          <div className="feed-grid mt-12 grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
            {visibleWorks.map((work, index) => (
              <WorkCard
                key={work.id || work.title}
                index={index}
                onCommentCreated={addCommentToPost}
                onCommentDeleted={deleteCommentFromPost}
                onLikeUpdated={updatePostLike}
                onSaveUpdated={updatePostSave}
                onDeleted={removePostFromFeed}
                onOpenPreview={openPostPreview}
                work={work}
              />
            ))}
          </div>
        )}

        <div ref={loadMoreRef} className="h-10" />

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

      <PostPreviewModal
        open={previewOpen}
        post={previewPost}
        loading={previewLoading}
        onClose={closePostPreview}
      />

      <Footer />
    </main>
  );
}

function Header({
  query,
  setQuery,
  searchSuggestions,
  scrollToWorks,
  scrollToCreators,
  handleSelectSearchSuggestion,
  openPostPreview,
}: {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  searchSuggestions: {
    works: FeedWork[];
    creators: Creator[];
  };
  scrollToWorks: () => void;
  scrollToCreators: () => void;
  handleSelectSearchSuggestion: () => void;
  openPostPreview: (postId?: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const username = user?.username || "";
  const profileId = user?.id || user?._id;
  const profileHref = profileId ? `/users/${profileId}` : "/auth?mode=login";

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

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
          <a className="nav-link" href="#works-section">
            Explore
          </a>
          <button className="nav-link" onClick={scrollToCreators} type="button">
            Trending
          </button>
          <a className="nav-link" href="/create-post">
            Create Post
          </a>
        </div>

        <div className="search-wrapper">
          <label className="search-bar">
            <FiSearch />
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for creative work..."
              type="text"
              value={query}
            />

            {query.trim() && (
              <button
                aria-label="Clear search"
                onClick={() => setQuery("")}
                type="button"
              >
                ×
              </button>
            )}
          </label>

          {query.trim() && (
            <div className="search-dropdown">
              <div className="search-dropdown-head">
                <strong>Kết quả tìm kiếm</strong>
                <button type="button" onClick={scrollToWorks}>
                  Xem tất cả
                </button>
              </div>

              {searchSuggestions.works.length === 0 &&
              searchSuggestions.creators.length === 0 ? (
                <p className="search-empty">Không tìm thấy kết quả phù hợp.</p>
              ) : (
                <>
                  {searchSuggestions.works.length > 0 && (
                    <div className="search-group">
                      <span>Posts</span>

                      {searchSuggestions.works.map((work) => (
                        <button
                          key={work.id || work.title}
                          type="button"
                          className="search-item"
                          onClick={() => {
                            setQuery("");
                            openPostPreview(work.id);
                          }}
                          disabled={!work.id}
                        >
                          {work.image ? (
                            work.mediaType === "video" ? (
                              <video
                                src={work.image}
                                muted
                                preload="metadata"
                              />
                            ) : (
                              <img
                                alt={work.title}
                                src={work.image}
                                loading="lazy"
                                decoding="async"
                              />
                            )
                          ) : (
                            <div className="search-thumb-placeholder">
                              {work.title.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div>
                            <strong>{work.title}</strong>
                            <p>{work.author}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchSuggestions.creators.length > 0 && (
                    <div className="search-group">
                      <span>Creators</span>

                      {searchSuggestions.creators.map((creator) => (
                        <a
                          key={creator.id || creator.name}
                          className="search-item"
                          href={
                            creator.id ? `/users/${creator.id}` : "#creators"
                          }
                        >
                          {creator.avatar ? (
                            <img src={creator.avatar} alt={creator.name} />
                          ) : (
                            <div className="search-thumb-placeholder">
                              {creator.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div>
                            <strong>{creator.name}</strong>
                            <p>
                              {creator.role ||
                                `${creator.followersCount || 0} followers`}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="ml-auto hidden min-h-[44px] items-center gap-4 text-lg lg:flex">
          {!mounted ? (
            <div aria-hidden="true" className="h-11 w-[170px]" />
          ) : isAuthenticated ? (
            <>
              <NotificationBell />

              <div className="profile-menu">
                <button
                  aria-expanded={profileOpen}
                  aria-label="Open profile menu"
                  className="profile-trigger"
                  onClick={() => setProfileOpen((current) => !current)}
                  type="button"
                >
                  <span>{(username || "U").charAt(0).toUpperCase()}</span>
                </button>

                {profileOpen && (
                  <div className="profile-dropdown">
                    <div>
                      <strong>{username}</strong>
                      <span>Creator account</span>
                    </div>

                    <a href={profileHref}>
                      <FiUser /> Portfolio
                    </a>

                    <a href="/feed">
                      <FiGrid /> Feed
                    </a>

                    <a href="/saved">
                      <FiBookmark /> Saved Posts
                    </a>

                    <button onClick={handleLogout} type="button">
                      <FiLogOut /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <a
                className="text-slate-500 transition hover:text-[#76875f]"
                href="/auth?mode=login"
              >
                Login
              </a>

              <a className="primary-button" href="/auth?mode=register">
                Sign Up
              </a>
            </>
          )}
        </div>

        {mounted && !isAuthenticated && (
          <a
            aria-label="Open profile"
            className="icon-button"
            href="/auth?mode=login"
          >
            <FiUser />
          </a>
        )}
      </nav>
    </header>
  );
}

type HeaderNotification = {
  _id: string;
  isRead?: boolean;
  message?: string;
  type?: string;
  createdAt?: string;
  sender?: {
    username?: string;
    avatar?: string;
  };
  post?: {
    _id?: string;
    title?: string;
  };
};

type ModalComment = {
  _id?: string;
  id?: string;
  authorName?: string;
  content?: string;
  createdAt?: string;
};

type ModalPost = {
  _id: string;
  title?: string;
  content?: string;
  media?: Array<{
    url?: string;
    type?: string;
  }>;
  image?: string;
  tags?: string[];
  authorName?: string;
  author?: {
    username?: string;
    avatar?: string;
  };
  createdAt?: string;
  likes?: string[];
  likedBy?: string[];
  savedBy?: string[];
  comments?: ModalComment[];
  commentsCount?: number;
};

function PostPreviewModal({
  post,
  loading,
  open,
  onClose,
}: {
  post: ModalPost | null;
  loading: boolean;
  open: boolean;
  onClose: () => void;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated } = useAuthStore();
  const [localPost, setLocalPost] = useState<ModalPost | null>(post);
  const [commentContent, setCommentContent] = useState("");
  const [modalError, setModalError] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const currentUserId = user?.id || user?._id || "";
  const currentUserName = user?.username || getCurrentUserName();

  useEffect(() => {
    setLocalPost(post);
    setModalError("");
    setCommentContent("");
  }, [post?._id, post]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const authorName =
    localPost?.author?.username || localPost?.authorName || "Người dùng";

  const authorAvatar = localPost?.author?.avatar;

  const media = localPost?.media?.[0];
  const mediaUrl = media?.url || localPost?.image;

  const isVideo = isVideoMedia(mediaUrl, media?.type);

  const likedBy = localPost?.likedBy || localPost?.likes || [];
  const savedBy = localPost?.savedBy || [];
  const comments = localPost?.comments || [];

  const isLiked = Boolean(
    currentUserId && likedBy.some((id) => id?.toString() === currentUserId)
  );

  const isSaved = Boolean(
    currentUserId && savedBy.some((id) => id?.toString() === currentUserId)
  );

  const handleModalLike = async () => {
    setModalError("");

    if (!localPost?._id) return;

    if (!isAuthenticated) {
      setModalError("Please login to continue");
      return;
    }

    try {
      const response = await api.post(`/posts/${localPost._id}/like`);
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Like failed");
      }

      setLocalPost((current) => {
        if (!current) return current;

        const nextLiked = result.data.liked;
        const nextLikesCount = result.data.likesCount || 0;
        const fakeLikes = Array.from({ length: nextLikesCount }, (_, index) =>
          index === 0 && nextLiked ? currentUserId : `like-${index}`
        );

        return {
          ...current,
          likes: fakeLikes,
          likedBy: fakeLikes,
        };
      });
    } catch (error) {
      setModalError(getRequestErrorMessage(error));
    }
  };

  const handleModalSave = async () => {
    setModalError("");

    if (!localPost?._id) return;

    if (!isAuthenticated) {
      setModalError("Please login to continue");
      return;
    }

    try {
      const response = await api.post(`/posts/${localPost._id}/save`);
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Save failed");
      }

      setLocalPost((current) => {
        if (!current) return current;

        const nextSaved = result.data.saved;
        const nextSavesCount = result.data.savesCount || 0;
        const fakeSavedBy = Array.from({ length: nextSavesCount }, (_, index) =>
          index === 0 && nextSaved ? currentUserId : `save-${index}`
        );

        return {
          ...current,
          savedBy: fakeSavedBy,
        };
      });
    } catch (error) {
      setModalError(getRequestErrorMessage(error));
    }
  };

  const handleModalComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setModalError("");

    if (!localPost?._id) return;

    if (!isAuthenticated) {
      setModalError("Please login to continue");
      return;
    }

    if (!commentContent.trim()) {
      setModalError("Please write a comment.");
      return;
    }

    setIsCommenting(true);

    try {
      const response = await api.post(`/posts/${localPost._id}/comments`, {
        content: commentContent.trim(),
      });

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Create comment failed");
      }

      const newComment: ModalComment = {
        _id: result.data._id,
        id: result.data._id,
        authorName: result.data.authorName || currentUserName,
        content: result.data.content,
        createdAt: result.data.createdAt,
      };

      setLocalPost((current) => {
        if (!current) return current;

        return {
          ...current,
          comments: [newComment, ...(current.comments || [])],
          commentsCount:
            (current.commentsCount || current.comments?.length || 0) + 1,
        };
      });

      setCommentContent("");
    } catch (error) {
      setModalError(getRequestErrorMessage(error));
    } finally {
      setIsCommenting(false);
    }
  };

  const modalContent = (
    <div
      ref={backdropRef}
      role="presentation"
      onClick={(event) => {
        if (event.target === backdropRef.current) {
          onClose();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(18, 22, 17, 0.6)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chi tiết bài viết"
        className="post-preview-modal"
        style={{
          width: "min(720px, 100%)",
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: "24px",
          background: "#fbfcf7",
          boxShadow: "0 30px 90px rgba(0, 0, 0, 0.35)",
        }}
      >
        <div
          className="post-preview-header"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            padding: "18px 22px",
            borderBottom: "1px solid #dde4d4",
            background: "#fbfcf7",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 4px",
                color: "#91a37d",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.22em",
                WebkitFontSmoothing: "auto",
                textTransform: "uppercase",
              }}
            >
              Post details
            </p>

            <h2
              style={{
                margin: 0,
                color: "#2d3028",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: "22px",
                fontWeight: 500,
                lineHeight: 1.25,
                letterSpacing: "normal",
                fontFeatureSettings: "normal",
                fontSynthesis: "none" /* thêm */,
                textRendering: "optimizeSpeed" /* thêm - tắt ligature */,
              }}
            >
              From notification
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            style={{
              width: "40px",
              height: "40px",
              border: 0,
              borderRadius: "999px",
              background: "#e7ecdf",
              color: "#5f6d54",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            <FiX />
          </button>
        </div>

        {loading ? (
          <div
            style={{
              padding: "32px",
              color: "#697461",
              fontSize: "15px",
            }}
          >
            Đang tải bài viết...
          </div>
        ) : !localPost ? (
          <div
            style={{
              padding: "32px",
              color: "#697461",
              fontSize: "15px",
            }}
          >
            Không tìm thấy bài viết từ thông báo này.
          </div>
        ) : (
          <div className="post-preview-body" style={{ padding: "22px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "18px",
              }}
            >
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <span
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#91a37d",
                    color: "#fff",
                    fontWeight: 800,
                  }}
                >
                  {authorName.charAt(0).toUpperCase()}
                </span>
              )}

              <div>
                <strong
                  style={{
                    display: "block",
                    color: "#2d3028",
                    fontSize: "15px",
                  }}
                >
                  {authorName}
                </strong>

                {localPost.createdAt && (
                  <small
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      color: "#7d8774",
                      fontSize: "13px",
                    }}
                  >
                    <FiCalendar />
                    {new Date(localPost.createdAt).toLocaleDateString("vi-VN")}
                  </small>
                )}
              </div>
            </div>

            <h3
              style={{
                margin: "0 0 10px",
                color: "#2d3028",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: "26px",
                fontWeight: 700,
                lineHeight: 1.25,
                letterSpacing: "normal",
                fontSynthesis: "none",
              }}
            >
              {localPost.title || "Không có tiêu đề"}
            </h3>

            {localPost.content && (
              <p
                style={{
                  margin: "0 0 18px",
                  color: "#586174",
                  fontSize: "15px",
                  lineHeight: 1.65,
                }}
              >
                {localPost.content}
              </p>
            )}

            {mediaUrl ? (
              isVideo ? (
                <video
                  controls
                  preload="metadata"
                  src={mediaUrl}
                  style={{
                    display: "block",
                    width: "100%",
                    maxHeight: "460px",
                    objectFit: "contain",
                    borderRadius: "18px",
                    background: "#111827",
                  }}
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt={localPost.title || "Post"}
                  style={{
                    display: "block",
                    width: "100%",
                    maxHeight: "460px",
                    objectFit: "cover",
                    borderRadius: "18px",
                    background: "#eef1ea",
                  }}
                />
              )
            ) : null}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "8px",
                marginTop: "18px",
                paddingTop: "14px",
                borderTop: "1px solid #e8ede3",
              }}
            >
              <button
                type="button"
                onClick={handleModalLike}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  border: 0,
                  background: isLiked ? "#fff2f2" : "#f0f4ec",
                  borderRadius: "999px",
                  padding: "8px 14px",
                  color: isLiked ? "#d33f49" : "#6f7f5c",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <FiHeart fill={isLiked ? "currentColor" : "none"} />
                {likedBy.length}
              </button>

              <button
                type="button"
                onClick={handleModalSave}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  border: 0,
                  background: isSaved ? "#edf6e9" : "#f0f4ec",
                  borderRadius: "999px",
                  padding: "8px 14px",
                  color: isSaved ? "#5f7b50" : "#6f7f5c",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <FiBookmark fill={isSaved ? "currentColor" : "none"} />
                {savedBy.length}
              </button>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#f0f4ec",
                  borderRadius: "999px",
                  padding: "8px 14px",
                  color: "#6f7f5c",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                <FiMessageCircle />
                {localPost?.commentsCount || comments.length || 0}
              </span>
            </div>
            <form
              onSubmit={handleModalComment}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) 42px",
                gap: "8px",
                marginTop: "14px",
              }}
            >
              <input
                value={commentContent}
                onChange={(event) => setCommentContent(event.target.value)}
                placeholder={
                  isAuthenticated
                    ? "Write a comment..."
                    : "Please login to comment"
                }
                disabled={!isAuthenticated || isCommenting}
                style={{
                  width: "100%",
                  border: "1px solid #dfe3d9",
                  borderRadius: "999px",
                  background: "#ffffff",
                  padding: "10px 14px",
                  color: "#252525",
                  outline: "none",
                }}
              />

              <button
                type="submit"
                disabled={!isAuthenticated || isCommenting}
                style={{
                  border: 0,
                  borderRadius: "999px",
                  background: "#9caf88",
                  color: "#ffffff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  opacity: !isAuthenticated || isCommenting ? 0.6 : 1,
                }}
              >
                <FiSend />
              </button>
            </form>

            {comments.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gap: "8px",
                  marginTop: "14px",
                }}
              >
                {comments.slice(0, 5).map((comment) => (
                  <div
                    key={comment._id || comment.id || comment.content}
                    style={{
                      borderRadius: "14px",
                      background: "#f0f4ec",
                      padding: "10px 12px",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        color: "#2d3028",
                        fontSize: "13px",
                      }}
                    >
                      {comment.authorName || "Unknown user"}
                    </strong>
                    <p
                      style={{
                        margin: "4px 0 0",
                        color: "#586174",
                        fontSize: "14px",
                        lineHeight: 1.45,
                      }}
                    >
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {modalError && (
              <p
                style={{
                  margin: "10px 0 0",
                  color: "#9b2c2c",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {modalError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

function NotificationBell() {
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [activePost, setActivePost] = useState<ModalPost | null>(null);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [postModalLoading, setPostModalLoading] = useState(false);
  const [bellOpened, setBellOpened] = useState(false);

  const unreadCount = bellOpened
    ? 0
    : notifications.filter((item) => !item.isRead).length;

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      try {
        const response = await api.get("/notifications");
        const data = (response.data.notifications ||
          []) as HeaderNotification[];

        if (active) {
          setNotifications(data);
        }
      } catch {
        if (active) {
          setNotifications([]);
        }
      }
    }

    const handleNewNotification = (notification: HeaderNotification) => {
      setNotifications((current) => {
        const existed = current.some((item) => item._id === notification._id);
        if (existed) return current;
        return [notification, ...current];
      });
      setBellOpened(false);
    };

    loadNotifications();

    socket.on("new_notification", handleNewNotification);
    socket.on("notification", handleNewNotification);

    return () => {
      active = false;
      socket.off("new_notification", handleNewNotification);
      socket.off("notification", handleNewNotification);
    };
  }, []);

  const openPostModal = async (postId: string) => {
    setOpen(false);
    setPostModalOpen(true);
    setPostModalLoading(true);
    setActivePost(null);

    try {
      const [postResponse, commentsResponse] = await Promise.all([
        api.get(`/posts/${postId}`),
        api.get(`/posts/${postId}/comments`),
      ]);

      const postData =
        postResponse.data.data || postResponse.data.post || postResponse.data;

      const commentsData = commentsResponse.data.data || [];

      setActivePost({
        ...postData,
        comments: commentsData,
        commentsCount: commentsData.length,
      });
    } catch (error) {
      console.log("Open post modal error:", error);
    } finally {
      setPostModalLoading(false);
    }
  };

  const closePostModal = () => {
    setPostModalOpen(false);
    setActivePost(null);
  };

  const handleReadNotification = async (notification: HeaderNotification) => {
    try {
      if (!notification?._id) return;

      if (!notification.isRead) {
        await api.put(`/notifications/${notification._id}/read`);

        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id ? { ...item, isRead: true } : item
          )
        );
      }

      if (notification.post?._id) {
        await openPostModal(notification.post._id);
      }
    } catch (error) {
      console.log("Open notification error:", error);
    }
  };

  return (
    <>
      <div className="notification-menu">
        <button
          aria-expanded={open}
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
          className="notification-trigger"
          onClick={() => {
            const next = !open;
            setOpen(next);
            if (next) setBellOpened(true); // chỉ ẩn badge, giữ nguyên isRead
          }}
          type="button"
        >
          <FiBell />
          {unreadCount > 0 && (
            <span>{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </button>

        {open && (
          <div className="notification-dropdown">
            <div className="notification-popover-head">
              <div>
                <strong>Activity</strong>
                <span>
                  {unreadCount ? `${unreadCount} unread` : "All caught up"}
                </span>
              </div>
            </div>

            <div className="notification-popover-body">
              {notifications.length === 0 ? (
                <div className="notification-empty-state">
                  <span>
                    <FiBell />
                  </span>
                  <strong>You are all caught up</strong>
                  <p>
                    New likes, comments, saves, follows and posts from creators
                    you follow will land here.
                  </p>
                </div>
              ) : (
                notifications.slice(0, 6).map((item) => (
                  <button
                    className={`notification-row ${
                      item.isRead ? "" : "unread"
                    }`}
                    key={item._id}
                    onClick={() => handleReadNotification(item)}
                    type="button"
                  >
                    <span className="notification-row-avatar">
                      {item.sender?.avatar ? (
                        <img
                          alt={item.sender?.username || "User"}
                          src={item.sender.avatar}
                        />
                      ) : (
                        (item.sender?.username || "?").charAt(0).toUpperCase()
                      )}
                    </span>

                    <span>
                      <span className="notification-row-kicker">
                        {item.type?.replace("_", " ") || "activity"}
                      </span>
                      <strong>{item.sender?.username || "Someone"}</strong>{" "}
                      <span className="notification-row-message">
                        {item.message || item.type}
                      </span>
                      {item.post?.title && <em>{item.post.title}</em>}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <PostPreviewModal
        open={postModalOpen}
        post={activePost}
        loading={postModalLoading}
        onClose={closePostModal}
      />
    </>
  );
}

function Hero({ scrollToWorks }: { scrollToWorks: () => void }) {
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
            <a className="primary-button large" href="/create-post">
              Start Creating
            </a>

            <button
              className="outline-button large"
              onClick={scrollToWorks}
              type="button"
            >
              Explore Works
            </button>
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
  onLikeUpdated,
  onSaveUpdated,
  onCommentCreated,
  onCommentDeleted,
  onDeleted,
  onOpenPreview,
}: {
  work: FeedWork;
  index: number;
  onCommentCreated: (postId: string, comment: CommentItem) => void;
  onCommentDeleted: (postId: string, commentId: string) => void;
  onLikeUpdated: (postId: string, likeData: LikeData) => void;
  onSaveUpdated: (postId: string, saveData: SaveData) => void;
  onDeleted: (postId: string) => void;
  onOpenPreview: (postId?: string) => void;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const [likeError, setLikeError] = useState("");
  const [actionError, setActionError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentUserId = user?.id || user?._id || "";
  const currentUserName = user?.username || "";
  const isOwner = Boolean(
    isAuthenticated &&
      work.id &&
      ((work.authorId &&
        currentUserId &&
        work.authorId.toString() === currentUserId.toString()) ||
        (currentUserName &&
          work.author?.trim().toLowerCase() ===
            currentUserName.trim().toLowerCase()))
  );

  const handleLike = async () => {
    setLikeError("");

    if (!work.id) {
      setLikeError("Only saved posts can be liked.");
      return;
    }

    if (!isAuthenticated) {
      setLikeError("Please login to continue");
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
      setLikeError(getErrorMessage(requestError));
    }
  };

  const handleSave = async () => {
    setActionError("");

    if (!work.id) {
      setActionError("Only saved posts can be bookmarked.");
      return;
    }

    if (!isAuthenticated) {
      setActionError("Please login to continue");
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
      setActionError(getErrorMessage(requestError));
    }
  };

  const handleDelete = async () => {
    setActionError("");

    if (!isAuthenticated) {
      setActionError("Please login to continue");
      return;
    }

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
      setActionError(getErrorMessage(requestError));
      setIsDeleting(false);
    }
  };

  return (
    <article
      className={`work-card reveal ${
        work.span === "tall" ? "lg:row-span-2" : ""
      }`}
      style={{ "--delay": `${index * 90}ms` } as StyleWithDelay}
    >
      <button
        className="work-image"
        onClick={() => onOpenPreview(work.id)}
        type="button"
        disabled={!work.id}
      >
        {work.mediaType === "video" ? (
          <video muted playsInline preload="metadata" src={work.image} />
        ) : (
          <img
            alt={work.title}
            src={work.image}
            loading="lazy"
            decoding="async"
          />
        )}
      </button>

      <div className="mt-5 flex items-center gap-3">
        <img alt={work.author} className="avatar" src={work.avatar} />
        {work.authorId ? (
          <a
            className="text-lg font-semibold transition hover:text-[#6f7e5b]"
            href={`/users/${work.authorId}`}
          >
            {work.author}
          </a>
        ) : (
          <span className="text-lg font-semibold">{work.author}</span>
        )}
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

        {work.id && isOwner && (
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

        {work.tags.map((tag: string) => (
          <span className="tag" key={formatTagLabel(tag)}>
            {formatTagLabel(tag)}
          </span>
        ))}
      </div>

      <CommentSection
        onCommentCreated={onCommentCreated}
        onCommentDeleted={onCommentDeleted}
        work={work}
      />

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

function CommentSection({
  work,
  onCommentCreated,
  onCommentDeleted,
}: {
  work: FeedWork;
  onCommentCreated: (postId: string, comment: CommentItem) => void;
  onCommentDeleted: (postId: string, commentId: string) => void;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("nhuquynh");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [visibleCommentCount, setVisibleCommentCount] = useState(3);

  const comments = work.comments || [];

  useEffect(() => {
    setAuthorName(user?.username || getCurrentCommentAuthor());
  }, [user?.username]);

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!work.id) {
      setError("Only saved posts can receive comments.");
      return;
    }

    if (!isAuthenticated) {
      setError("Please login to continue");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post(`/posts/${work.id}/comments`, {
        content: content.trim(),
      });
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
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!work.id) return;

    const confirmed = window.confirm(
      "Bạn có chắc muốn xoá bình luận này không?"
    );
    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/posts/${work.id}/comments/${commentId}`);

      onCommentDeleted(work.id, commentId);
    } catch (error) {
      setError(getRequestErrorMessage(error));
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
            {comments.slice(0, visibleCommentCount).map((comment) => {
              const canDelete =
                comment.authorName?.trim().toLowerCase() ===
                authorName.trim().toLowerCase();

              return (
                <article className="comment-item" key={comment.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong>{comment.authorName}</strong>
                      <p>{comment.content}</p>
                    </div>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => deleteComment(comment.id)}
                        className="text-sm font-bold text-red-600 hover:text-red-800"
                      >
                        Xoá
                      </button>
                    )}
                  </div>
                </article>
              );
            })}

            {comments.length > visibleCommentCount && (
              <button
                type="button"
                onClick={() => setVisibleCommentCount((count) => count + 5)}
                className="mt-2 text-sm font-bold text-[#6f7e5b] hover:text-[#252525]"
              >
                Xem thêm bình luận cũ
              </button>
            )}

            {comments.length > 3 && visibleCommentCount >= comments.length && (
              <button
                type="button"
                onClick={() => setVisibleCommentCount(3)}
                className="mt-2 text-sm font-bold text-[#6f7e5b] hover:text-[#252525]"
              >
                Thu gọn bình luận
              </button>
            )}
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
                  !isAuthenticated
                    ? "Please login to continue"
                    : work.id
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

function CreatorCard({
  creator,
  index,
  onFollowUpdated,
}: {
  creator: Creator;
  index: number;
  onFollowUpdated: (creatorId: string, followData: FollowData) => void;
}) {
  const { isAuthenticated } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const handleFollow = async () => {
    setError("");

    if (!isAuthenticated) {
      setError("Please login to continue");
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
      setError(getRequestErrorMessage(requestError));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <article
      className="creator-card reveal"
      style={{ "--delay": `${index * 80}ms` } as StyleWithDelay}
    >
      <div className="flex items-center gap-5">
        <a
          className="relative"
          href={creator.id ? `/users/${creator.id}` : "#"}
        >
          <img
            alt={creator.name}
            className="creator-avatar"
            src={creator.avatar}
            loading="lazy"
            decoding="async"
          />
          <span className="verified">
            <FiCheck />
          </span>
        </a>

        <div>
          <a href={creator.id ? `/users/${creator.id}` : "#"}>
            <h3 className="creator-name transition hover:text-[#6f7e5b]">
              {creator.name}
            </h3>
          </a>
          <p className="text-lg text-slate-600">{creator.role}</p>
        </div>
      </div>

      <div className="mt-8 flex items-end justify-between border-t border-[#dfe3d9] pt-6">
        <div className="flex gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.14em] text-slate-500">
              Posts
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {creator.postsCount || 0}
            </p>
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.14em] text-slate-500">
              Followers
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {creator.followersCount || 0}
            </p>
          </div>
        </div>

        <button
          className="follow-button"
          disabled={isUpdating}
          onClick={handleFollow}
          type="button"
        >
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
