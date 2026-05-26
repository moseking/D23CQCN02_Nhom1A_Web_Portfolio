"use client";

/* eslint-disable @next/next/no-img-element */

import {
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  FiArrowLeft,
  FiCalendar,
  FiEdit3,
  FiExternalLink,
  FiGrid,
  FiHeart,
  FiLayers,
  FiMapPin,
  FiMonitor,
  FiSave,
  FiStar,
  FiUserCheck,
  FiUserPlus,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80";

const DEFAULT_POST_IMAGE =
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80";

type PortfolioUser = {
  _id: string;
  username: string;
  email?: string;
  avatar?: string;
  bio?: string;
  portfolio?: {
    title?: string;
    location?: string;
    website?: string;
    layout?: PortfolioLayout;
    theme?: PortfolioThemeName | "";
  };
  role?: string;
  createdAt?: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isSelf: boolean;
};

type PortfolioPost = {
  _id: string;
  title?: string;
  content?: string;
  media?: Array<{
    url?: string;
    type?: "image" | "video";
  }>;
  tags?: string[];
  likes?: string[];
  likedBy?: string[];
  savedBy?: string[];
  createdAt?: string;
};

type PortfolioPayload = {
  user: PortfolioUser;
  posts: PortfolioPost[];
  stats: {
    postsCount: number;
    likesCount: number;
    followersCount: number;
    followingCount: number;
  };
  featuredTags: string[];
};

type PortfolioLayout = "showcase" | "grid" | "studio";
type PortfolioThemeName = "aurora" | "gallery" | "noir" | "mint";

const themes = [
  {
    name: "aurora",
    accent: "#8DAA72",
    deep: "#24301F",
    soft: "#EEF5EA",
    wash: "#DCE8D2",
    animation: "portfolio-drift",
  },
  {
    name: "gallery",
    accent: "#B46B57",
    deep: "#2F2420",
    soft: "#FFF1EB",
    wash: "#F4D6C9",
    animation: "portfolio-tilt",
  },
  {
    name: "noir",
    accent: "#6877B8",
    deep: "#202437",
    soft: "#EEF1FF",
    wash: "#D9DDF4",
    animation: "portfolio-pulse",
  },
  {
    name: "mint",
    accent: "#4F9A92",
    deep: "#183331",
    soft: "#EAF8F6",
    wash: "#CBE9E4",
    animation: "portfolio-orbit",
  },
];

type PortfolioTheme = (typeof themes)[number];

type PortfolioFormValues = {
  username: string;
  avatar: string;
  bio: string;
  title: string;
  location: string;
  website: string;
  layout: PortfolioLayout;
  theme: PortfolioThemeName | "";
};

function pickTheme(seed: string) {
  const total = seed
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return themes[total % themes.length];
}

function formatDate(value?: string) {
  if (!value) return "New member";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Cannot load portfolio";
}

function getRequestErrorMessage(error: unknown) {
  const requestError = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  return requestError.response?.data?.message || getErrorMessage(error);
}

export default function UserPortfolioPage() {
  const params = useParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { isAuthenticated, fetchCurrentUser } = useAuthStore();
  const [portfolio, setPortfolio] = useState<PortfolioPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followError, setFollowError] = useState("");
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileForm, setProfileForm] = useState<PortfolioFormValues>({
    username: "",
    avatar: "",
    bio: "",
    title: "",
    location: "",
    website: "",
    layout: "showcase",
    theme: "",
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadPortfolio() {
      if (!userId) return;

      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/auth/users/${userId}/portfolio`, {
          signal: controller.signal,
        });

        setPortfolio(response.data.data);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(getRequestErrorMessage(requestError));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPortfolio();

    return () => controller.abort();
  }, [userId]);

  const theme = useMemo(() => {
    const savedTheme = themes.find(
      (item) => item.name === portfolio?.user.portfolio?.theme
    );

    return savedTheme || pickTheme(portfolio?.user._id || userId || "artfolio");
  }, [portfolio?.user._id, portfolio?.user.portfolio?.theme, userId]);

  const editorTheme = useMemo(
    () => themes.find((item) => item.name === profileForm.theme) || theme,
    [profileForm.theme, theme]
  );

  const layout = portfolio?.user.portfolio?.layout || "showcase";

  useEffect(() => {
    if (!isEditorOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsEditorOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditorOpen]);

  const openEditor = () => {
    if (!portfolio?.user.isSelf) return;

    setProfileError("");
    setProfileForm({
      username: portfolio.user.username,
      avatar: portfolio.user.avatar || "",
      bio: portfolio.user.bio || "",
      title: portfolio.user.portfolio?.title || "",
      location: portfolio.user.portfolio?.location || "",
      website: portfolio.user.portfolio?.website || "",
      layout: portfolio.user.portfolio?.layout || "showcase",
      theme: portfolio.user.portfolio?.theme || "",
    });
    setIsEditorOpen(true);
  };

  const updateProfileField = (
    field: keyof PortfolioFormValues,
    value: string
  ) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleProfileSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!portfolio?.user.isSelf) return;

    try {
      setIsSavingProfile(true);
      setProfileError("");

      const response = await api.patch("/auth/me/profile", {
        username: profileForm.username,
        avatar: profileForm.avatar,
        bio: profileForm.bio,
        portfolio: {
          title: profileForm.title,
          location: profileForm.location,
          website: profileForm.website,
          layout: profileForm.layout,
          theme: profileForm.theme,
        },
      });

      const updatedUser = response.data.data;

      setPortfolio((current) =>
        current
          ? {
              ...current,
              user: {
                ...current.user,
                username: updatedUser.username,
                avatar: updatedUser.avatar,
                bio: updatedUser.bio,
                portfolio: updatedUser.portfolio,
              },
            }
          : current
      );

      await fetchCurrentUser();
      setIsEditorOpen(false);
    } catch (requestError) {
      setProfileError(getRequestErrorMessage(requestError));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleFollow = async () => {
    if (!portfolio) return;

    setFollowError("");

    if (portfolio.user.isSelf) {
      setFollowError("You cannot follow yourself.");
      return;
    }

    if (!isAuthenticated) {
      setFollowError("Please login to follow this creator.");
      return;
    }

    try {
      setIsUpdatingFollow(true);
      const response = await api.post(`/auth/users/${portfolio.user._id}/follow`);
      const data = response.data.data;

      setPortfolio((current) =>
        current
          ? {
              ...current,
              user: {
                ...current.user,
                isFollowing: data.followed,
                followersCount: data.followersCount,
              },
              stats: {
                ...current.stats,
                followersCount: data.followersCount,
              },
            }
          : current
      );
    } catch (requestError) {
      setFollowError(getRequestErrorMessage(requestError));
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  if (loading) {
    return (
      <main className="portfolio-page min-h-screen px-6 py-8 sm:px-10 lg:px-12">
        <div className="portfolio-loading">Loading portfolio...</div>
      </main>
    );
  }

  if (error || !portfolio) {
    return (
      <main className="portfolio-page min-h-screen px-6 py-8 sm:px-10 lg:px-12">
        <a className="quiet-link" href="/feed#creators">
          <FiArrowLeft /> Back to creators
        </a>
        <div className="portfolio-empty mt-8">
          <h1>Portfolio not found</h1>
          <p>{error || "This user profile is unavailable."}</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`portfolio-page portfolio-theme-${theme.name} portfolio-layout-${layout} min-h-screen`}
      style={
        {
          "--portfolio-accent": theme.accent,
          "--portfolio-deep": theme.deep,
          "--portfolio-soft": theme.soft,
          "--portfolio-wash": theme.wash,
        } as CSSProperties
      }
    >
      <section className="portfolio-hero px-6 py-8 sm:px-10 lg:px-12">
        <nav className="mx-auto flex max-w-[1560px] items-center justify-between gap-4">
          <a className="brand" href="/feed">
            <span className="brand-mark">
              <FiStar />
            </span>
            <span>Artfolio</span>
          </a>

          <a className="outline-button compact gap-2" href="/feed#creators">
            <FiArrowLeft /> Creators
          </a>
        </nav>

        <div className="portfolio-hero-grid mx-auto max-w-[1560px]">
          <div className="portfolio-profile reveal">
            <div className={`portfolio-avatar-frame ${theme.animation}`}>
              <img
                alt={portfolio.user.username}
                src={portfolio.user.avatar || DEFAULT_AVATAR}
              />
            </div>

            <div>
              <p className="eyebrow">Personal Portfolio</p>
              <h1>{portfolio.user.portfolio?.title || portfolio.user.username}</h1>
              {portfolio.user.portfolio?.title && (
                <p className="portfolio-display-name">@{portfolio.user.username}</p>
              )}
              <p className="portfolio-bio">
                {portfolio.user.bio ||
                  "A visual storyteller building a living archive of creative work, experiments, and portfolio studies."}
              </p>

              <div className="portfolio-meta">
                <span>
                  <FiCalendar /> Joined {formatDate(portfolio.user.createdAt)}
                </span>
                <span>
                  <FiLayers /> {portfolio.featuredTags[0] || "Creative"}
                </span>
                {portfolio.user.portfolio?.location && (
                  <span>
                    <FiMapPin /> {portfolio.user.portfolio.location}
                  </span>
                )}
              </div>

              <div className="portfolio-actions">
                {portfolio.user.isSelf ? (
                  <button className="primary-button gap-2" onClick={openEditor} type="button">
                    <FiEdit3 /> Edit Portfolio
                  </button>
                ) : (
                  <button
                    className="primary-button gap-2"
                    disabled={isUpdatingFollow}
                    onClick={handleFollow}
                    type="button"
                  >
                    {portfolio.user.isFollowing ? <FiUserCheck /> : <FiUserPlus />}
                    {isUpdatingFollow
                      ? "Updating..."
                      : portfolio.user.isFollowing
                        ? "Following"
                        : "Follow"}
                  </button>
                )}

                <a className="outline-button gap-2" href="#portfolio-work">
                  <FiGrid /> View Work
                </a>

                {portfolio.user.portfolio?.website && (
                  <a
                    className="outline-button gap-2"
                    href={portfolio.user.portfolio.website}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <FiExternalLink /> Website
                  </a>
                )}
              </div>

              {followError && <p className="comment-error">{followError}</p>}
            </div>
          </div>

          <div className="portfolio-showcase reveal">
            <PortfolioPreview posts={portfolio.posts} theme={theme} />
          </div>
        </div>
      </section>

      <section className="portfolio-dashboard px-6 pb-20 sm:px-10 lg:px-12">
        <div className="mx-auto grid max-w-[1560px] gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="portfolio-side">
            <div className="portfolio-stats">
              <StatBlock icon={<FiGrid />} label="Posts" value={portfolio.stats.postsCount} />
              <StatBlock icon={<FiHeart />} label="Likes" value={portfolio.stats.likesCount} />
              <StatBlock icon={<FiUsers />} label="Followers" value={portfolio.stats.followersCount} />
            </div>

            <div className="portfolio-panel">
              <h2>Signature Tags</h2>
              <div className="portfolio-tags">
                {(portfolio.featuredTags.length
                  ? portfolio.featuredTags
                  : ["portfolio", "creative", "visual"]
                ).map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            </div>

            <div className="portfolio-panel">
              <h2>About</h2>
              <p>
                {portfolio.user.bio ||
                  `${portfolio.user.username} has shared ${portfolio.stats.postsCount} portfolio pieces on Artfolio.`}
              </p>
            </div>
          </aside>

          <section className="portfolio-work" id="portfolio-work">
            <div className="portfolio-section-heading">
              <p className="eyebrow">Selected Work</p>
              <h2>Posted Projects</h2>
              {portfolio.user.isSelf && (
                <p className="portfolio-owner-note">
                  You can edit posts from your own portfolio. Posts from other
                  creators stay view-only.
                </p>
              )}
            </div>

            {portfolio.posts.length === 0 ? (
              <div className="portfolio-empty">
                <h3>No posts yet</h3>
                <p>This portfolio is ready for its first creative piece.</p>
              </div>
            ) : (
              <div className="portfolio-post-grid">
                {portfolio.posts.map((post, index) => (
                  <PortfolioPostCard
                    canEdit={portfolio.user.isSelf}
                    key={post._id}
                    post={post}
                    index={index}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      {isEditorOpen && portfolio.user.isSelf && (
        <div className="portfolio-editor-backdrop" role="presentation">
          <div
            aria-modal="false"
            className="portfolio-editor-shell"
            role="dialog"
          >
            <form className="portfolio-editor" onSubmit={handleProfileSave}>
              <div className="portfolio-editor-head">
                <div>
                  <p className="eyebrow">Portfolio Studio</p>
                  <h2>Edit Portfolio</h2>
                </div>
                <button
                  aria-label="Close editor"
                  className="icon-button"
                  onClick={() => setIsEditorOpen(false)}
                  type="button"
                >
                  <FiX />
                </button>
              </div>

              <section
                className="portfolio-editor-preview"
                style={
                  {
                    "--editor-accent": editorTheme.accent,
                    "--editor-deep": editorTheme.deep,
                    "--editor-soft": editorTheme.soft,
                    "--editor-wash": editorTheme.wash,
                  } as CSSProperties
                }
              >
                <div className={`portfolio-editor-preview-card ${editorTheme.animation}`}>
                  <img
                    alt={profileForm.username || portfolio.user.username}
                    src={profileForm.avatar || portfolio.user.avatar || DEFAULT_AVATAR}
                  />
                </div>

                <div className="portfolio-editor-preview-copy">
                  <span>{profileForm.layout}</span>
                  <h3>{profileForm.title || profileForm.username || portfolio.user.username}</h3>
                  <p>
                    {profileForm.bio ||
                      "Add a short bio so visitors understand your style and creative focus."}
                  </p>
                </div>

                <div className="portfolio-editor-preview-tags">
                  <span>{profileForm.location || "Location"}</span>
                  <span>{profileForm.theme || "Auto effect"}</span>
                  <span>{profileForm.website ? "Website ready" : "No website"}</span>
                </div>
              </section>

              <div className="portfolio-editor-section">
                <div className="portfolio-editor-section-title">
                  <span>01</span>
                  <div>
                    <h3>Display</h3>
                    <p>These details are shown first when someone opens your portfolio.</p>
                  </div>
                </div>

                <div className="portfolio-editor-grid">
                  <label>
                    Display name
                    <input
                      maxLength={40}
                      onChange={(event) => updateProfileField("username", event.target.value)}
                      value={profileForm.username}
                    />
                  </label>

                  <label>
                    Portfolio title
                    <input
                      maxLength={80}
                      onChange={(event) => updateProfileField("title", event.target.value)}
                      placeholder="Creative director, UI artist..."
                      value={profileForm.title}
                    />
                  </label>

                  <label className="wide">
                    Avatar URL
                    <input
                      onChange={(event) => updateProfileField("avatar", event.target.value)}
                      placeholder="https://..."
                      value={profileForm.avatar}
                    />
                  </label>
                </div>
              </div>

              <div className="portfolio-editor-section">
                <div className="portfolio-editor-section-title">
                  <span>02</span>
                  <div>
                    <h3>About</h3>
                    <p>Short story and public contact details for visitors.</p>
                  </div>
                </div>

                <div className="portfolio-editor-grid">
                  <label className="wide">
                    Bio
                    <textarea
                      maxLength={280}
                      onChange={(event) => updateProfileField("bio", event.target.value)}
                      rows={4}
                      value={profileForm.bio}
                    />
                  </label>

                  <label>
                    Location
                    <input
                      maxLength={80}
                      onChange={(event) => updateProfileField("location", event.target.value)}
                      value={profileForm.location}
                    />
                  </label>

                  <label>
                    Website
                    <input
                      onChange={(event) => updateProfileField("website", event.target.value)}
                      placeholder="https://portfolio.com"
                      value={profileForm.website}
                    />
                  </label>
                </div>
              </div>

              <div className="portfolio-editor-section">
                <div className="portfolio-editor-section-title">
                  <span>03</span>
                  <div>
                    <h3>Style</h3>
                    <p>Control the structure, color mood and motion effect.</p>
                  </div>
                </div>

                <div className="portfolio-choice-grid">
                  {[
                    { value: "showcase", label: "Showcase", note: "Hero stack" },
                    { value: "grid", label: "Gallery", note: "Clean grid" },
                    { value: "studio", label: "Studio", note: "Profile first" },
                  ].map((option) => (
                    <button
                      className={profileForm.layout === option.value ? "selected" : ""}
                      key={option.value}
                      onClick={() => updateProfileField("layout", option.value)}
                      type="button"
                    >
                      <FiGrid />
                      <strong>{option.label}</strong>
                      <span>{option.note}</span>
                    </button>
                  ))}
                </div>

                <div className="portfolio-theme-picker">
                  <button
                    className={profileForm.theme === "" ? "selected" : ""}
                    onClick={() => updateProfileField("theme", "")}
                    type="button"
                  >
                    <span style={{ background: theme.accent }} />
                    Auto
                  </button>

                  {themes.map((item) => (
                    <button
                      className={profileForm.theme === item.name ? "selected" : ""}
                      key={item.name}
                      onClick={() => updateProfileField("theme", item.name)}
                      type="button"
                    >
                      <span style={{ background: item.accent }} />
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              {profileError && <p className="comment-error">{profileError}</p>}

              <div className="portfolio-editor-actions">
                <button
                  className="outline-button gap-2"
                  onClick={() => setIsEditorOpen(false)}
                  type="button"
                >
                  <FiX /> Cancel
                </button>
                <button className="primary-button gap-2" disabled={isSavingProfile} type="submit">
                  <FiSave /> {isSavingProfile ? "Saving..." : "Save Portfolio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function PortfolioPreview({
  posts,
  theme,
}: {
  posts: PortfolioPost[];
  theme: PortfolioTheme;
}) {
  const previewPosts = posts.slice(0, 3);

  if (previewPosts.length === 0) {
    return (
      <div className={`portfolio-preview-empty ${theme.animation}`}>
        <FiStar />
        <span>Fresh portfolio space</span>
      </div>
    );
  }

  return (
    <div className="portfolio-preview-stack">
      {previewPosts.map((post, index) => {
        const media = post.media?.[0];

        return (
          <article
            className={`portfolio-preview-card ${theme.animation}`}
            key={post._id}
            style={{ "--stack-index": index } as CSSProperties}
          >
            {media?.type === "video" ? (
              <video src={media.url} muted playsInline />
            ) : (
              <img alt={post.title || "Portfolio preview"} src={media?.url || DEFAULT_POST_IMAGE} />
            )}
          </article>
        );
      })}
    </div>
  );
}

function StatBlock({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="portfolio-stat">
      <span>{icon}</span>
      <strong>{value.toLocaleString()}</strong>
      <em>{label}</em>
    </div>
  );
}

function PortfolioPostCard({
  canEdit,
  post,
  index,
}: {
  canEdit: boolean;
  post: PortfolioPost;
  index: number;
}) {
  const media = post.media?.[0];
  const mediaContent =
    media?.type === "video" ? (
      <video src={media.url} controls />
    ) : (
      <img alt={post.title || "Portfolio post"} src={media?.url || DEFAULT_POST_IMAGE} />
    );

  return (
    <article
      className="portfolio-post-card reveal"
      style={{ "--delay": `${index * 70}ms` } as CSSProperties}
    >
      {canEdit ? (
        <a className="portfolio-post-media" href={`/edit-post/${post._id}`}>
          {mediaContent}
        </a>
      ) : (
        <div className="portfolio-post-media" aria-label="Portfolio post preview">
          {mediaContent}
        </div>
      )}

      <div className="portfolio-post-body">
        <div className="portfolio-post-topline">
          <span>{formatDate(post.createdAt)}</span>
          {canEdit ? (
            <a aria-label="Edit post" href={`/edit-post/${post._id}`}>
              <FiEdit3 />
            </a>
          ) : (
            <span className="portfolio-view-only">
              <FiMonitor /> View only
            </span>
          )}
        </div>

        <h3>{post.title || "Untitled Project"}</h3>
        {post.content && <p>{post.content}</p>}

        <div className="portfolio-tags compact">
          {(post.tags || []).slice(0, 3).map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
