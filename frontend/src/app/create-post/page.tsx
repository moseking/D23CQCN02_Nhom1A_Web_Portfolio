"use client";

/* eslint-disable @next/next/no-img-element */

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiImage,
  FiLink,
  FiSend,
  FiStar,
  FiUpload,
} from "react-icons/fi";
import { api } from "../../lib/axios";
import { useAuthStore } from "../../store/authStore";

const FALLBACK_AUTHOR = "nhuquynh";
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const DEFAULT_PREVIEW =
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80";

type MediaType = "image" | "video";

type PostForm = {
  title: string;
  content: string;
  authorName: string;
  imageUrl: string;
  uploadedMediaPreview: string;
  uploadedMediaFile: File | null;
  uploadedMediaType: MediaType;
  tags: string;
};

const initialForm: PostForm = {
  title: "",
  content: "",
  authorName: FALLBACK_AUTHOR,
  imageUrl: "",
  uploadedMediaPreview: "",
  uploadedMediaFile: null,
  uploadedMediaType: "image",
  tags: "UI/UX, Portfolio",
};

function getCurrentUsername() {
  if (typeof window === "undefined") return FALLBACK_AUTHOR;

  const rawUser =
    localStorage.getItem("currentUser") ||
    localStorage.getItem("user") ||
    localStorage.getItem("account");

  if (rawUser) {
    try {
      const parsedUser = JSON.parse(rawUser);
      return (
        parsedUser.username ||
        parsedUser.name ||
        parsedUser.fullName ||
        FALLBACK_AUTHOR
      );
    } catch {
      return rawUser;
    }
  }

  return localStorage.getItem("username") || FALLBACK_AUTHOR;
}

function getErrorMessage(error: unknown) {
  const requestError = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
    message?: string;
  };

  if (requestError.response?.data?.message) {
    return requestError.response.data.message;
  }

  if (requestError.message) {
    return requestError.message;
  }

  return error instanceof Error ? error.message : "Request failed";
}

function isLikelyImageUrl(value: string) {
  return (
    /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(value) ||
    value.startsWith("data:image/")
  );
}

function isLikelyVideoUrl(value: string) {
  return (
    /\.(mp4|mov|ogg|webm)(\?.*)?$/i.test(value) ||
    value.startsWith("data:video/")
  );
}

function getMediaType(value: string): MediaType {
  return isLikelyVideoUrl(value) ? "video" : "image";
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function getFriendlyMediaError(message: string) {
  if (
    message.includes("request entity too large") ||
    message.includes("offset") ||
    message.includes("BSON")
  ) {
    return "File media quá lớn để lưu trực tiếp vào MongoDB. Hãy chọn video dưới 20MB hoặc dùng link video trực tiếp.";
  }

  return message;
}

function getUsableMediaUrl(value: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "";
  if (isLikelyImageUrl(trimmedValue) || isLikelyVideoUrl(trimmedValue))
    return trimmedValue;

  try {
    const url = new URL(trimmedValue);
    const mediaParamNames = [
      "mediaurl",
      "imgurl",
      "imageurl",
      "videourl",
      "url",
      "rurl",
      "u",
    ];

    for (const name of mediaParamNames) {
      const candidate = url.searchParams.get(name);
      if (
        candidate &&
        (isLikelyImageUrl(candidate) || isLikelyVideoUrl(candidate))
      ) {
        return candidate;
      }
    }

    return "";
  } catch {
    return "";
  }
}

export default function CreatePostPage() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [imageMode, setImageMode] = useState("url");
  const [error, setError] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      authorName: getCurrentUsername(),
    }));
  }, []);

  const urlMedia = useMemo(
    () => getUsableMediaUrl(form.imageUrl),
    [form.imageUrl]
  );

  const previewMedia = useMemo(() => {
    if (imageMode === "upload" && form.uploadedMediaPreview) {
      return form.uploadedMediaPreview;
    }

    if (urlMedia) return urlMedia;

    return DEFAULT_PREVIEW;
  }, [form.uploadedMediaPreview, imageMode, urlMedia]);

  const previewMediaType =
    imageMode === "upload"
      ? form.uploadedMediaType
      : getMediaType(previewMedia);
  const hasUnsupportedMediaUrl =
    imageMode === "url" && form.imageUrl.trim() && !urlMedia;

  const updateField = (
    field: Exclude<keyof PostForm, "uploadedMediaFile">,
    value: string
  ) => {
    if (field === "imageUrl") {
      setPreviewError(false);
    }

    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleMediaUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setError("Please choose an image or video file.");
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setError(
        `File ${formatBytes(
          file.size
        )} quá lớn. Upload từ máy chỉ hỗ trợ file dưới ${formatBytes(
          MAX_UPLOAD_BYTES
        )}; video lớn hãy dùng direct URL hoặc Cloudinary.`
      );
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setError("");
    setPreviewError(false);
    setForm((current) => ({
      ...current,
      uploadedMediaPreview: previewUrl,
      uploadedMediaFile: file,
      uploadedMediaType: file.type.startsWith("video/") ? "video" : "image",
    }));
    setImageMode("upload");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isAuthenticated) {
      setError("Please login to continue");
      return;
    }

    setIsSubmitting(true);

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      const formData = new FormData();

      formData.append("title", form.title.trim());
      formData.append("content", form.content.trim());
      formData.append("status", "published");
      formData.append("tags", JSON.stringify(tags));

      if (imageMode === "upload" && form.uploadedMediaFile) {
        formData.append("media", form.uploadedMediaFile);
      }

      if (imageMode === "url" && urlMedia) {
        formData.append(
          "media",
          JSON.stringify([
            {
              url: urlMedia,
              type: getMediaType(urlMedia),
            },
          ])
        );
      }

      const response = await api.post("/posts", formData);

      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Create post failed");
      }

      window.location.href = "/feed";
    } catch (requestError) {
      setError(getFriendlyMediaError(getErrorMessage(requestError)));
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="create-page min-h-screen bg-[#f7f8f3] px-6 py-6 text-[#252525] sm:px-10 lg:px-12">
      <nav className="mx-auto flex max-w-[1500px] items-center justify-between">
        <a className="brand" href="/feed">
          <span className="brand-mark">
            <FiStar />
          </span>
          <span>Artfolio</span>
        </a>
        <a className="outline-button compact gap-2" href="/feed">
          <FiArrowLeft /> Back to Feed
        </a>
      </nav>

      <section className="create-shell mx-auto grid max-w-[1500px] gap-8 py-10 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="create-intro reveal">
          <p className="eyebrow">Create Post</p>
          <h1>
            Share Your <span>Creative Work</span>
          </h1>
          <p>
            Compose a polished portfolio post, attach an image by URL or from
            your computer, then publish it straight to the feed.
          </p>
        </aside>

        <div className="create-card reveal">
          {!isAuthenticated ? (
            <div className="form-empty-state">
              <h2>Please login to continue</h2>
              <p className="mt-3 text-slate-600">
                You can explore public posts as a guest, but creating posts
                requires an account.
              </p>
              <a className="primary-button mt-6" href="/auth?mode=login">
                Login
              </a>
            </div>
          ) : (
            <form className="composer-form" onSubmit={handleSubmit}>
              <div className="field-grid two">
                <label>
                  <span>Title</span>
                  <input
                    minLength={3}
                    onChange={(event) =>
                      updateField("title", event.target.value)
                    }
                    placeholder="Mobile banking app redesign"
                    required
                    type="text"
                    value={form.title}
                  />
                </label>

                <label>
                  <span>Author</span>
                  <input
                    minLength={2}
                    onChange={(event) =>
                      updateField("authorName", event.target.value)
                    }
                    placeholder={FALLBACK_AUTHOR}
                    required
                    type="text"
                    value={form.authorName}
                  />
                </label>
              </div>

              <label>
                <span>Content</span>
                <textarea
                  minLength={10}
                  onChange={(event) =>
                    updateField("content", event.target.value)
                  }
                  placeholder="Write a short story about the concept, style, and design process..."
                  required
                  rows={6}
                  value={form.content}
                />
              </label>

              <div className="image-picker">
                <div className="image-picker-tabs">
                  <button
                    className={imageMode === "url" ? "active" : ""}
                    onClick={() => setImageMode("url")}
                    type="button"
                  >
                    <FiLink /> Image URL
                  </button>
                  <button
                    className={imageMode === "upload" ? "active" : ""}
                    onClick={() => setImageMode("upload")}
                    type="button"
                  >
                    <FiUpload /> Upload
                  </button>
                </div>

                {imageMode === "url" ? (
                  <label>
                    <span>Paste image link</span>
                    <div className="input-with-icon">
                      <FiImage />
                      <input
                        onChange={(event) =>
                          updateField("imageUrl", event.target.value)
                        }
                        placeholder="https://example.com/work.jpg or video.mp4"
                        type="url"
                        value={form.imageUrl}
                      />
                    </div>
                    {hasUnsupportedMediaUrl && (
                      <small className="image-url-help">
                        Paste a direct image/video URL. Examples: .jpg, .png,
                        .webp, .mp4, .webm.
                      </small>
                    )}
                    {urlMedia && urlMedia !== form.imageUrl.trim() && (
                      <small className="image-url-help success">
                        Found the direct media URL from your pasted link.
                      </small>
                    )}
                  </label>
                ) : (
                  <label className="upload-drop">
                    <FiUpload />
                    <strong>Choose image or video from your computer</strong>
                    <small>
                      PNG, JPG, WebP, MP4, WebM. Upload file dưới 8MB; video lớn
                      dùng URL.
                    </small>
                    <input
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      type="file"
                    />
                  </label>
                )}
              </div>

              <label>
                <span>Tags</span>
                <input
                  onChange={(event) => updateField("tags", event.target.value)}
                  placeholder="UI/UX, Branding, Mobile"
                  type="text"
                  value={form.tags}
                />
              </label>

              {error && <p className="form-error">{error}</p>}

              <button
                className="primary-button publish-button gap-3"
                disabled={isSubmitting}
                type="submit"
              >
                <FiSend /> {isSubmitting ? "Publishing..." : "Publish Post"}
              </button>
            </form>
          )}

          <article className="post-preview">
            <div className="preview-image">
              {hasUnsupportedMediaUrl || previewError ? (
                <div className="preview-placeholder">
                  <FiAlertCircle />
                  <strong>Cannot preview this media link</strong>
                  <span>
                    Paste a direct image/video URL or upload from your computer.
                  </span>
                </div>
              ) : previewMediaType === "video" ? (
                <video controls preload="metadata" src={previewMedia} />
              ) : (
                <img
                  alt="Post preview"
                  onError={() => setPreviewError(true)}
                  src={previewMedia}
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
            <div className="preview-body">
              <p className="preview-author">
                {form.authorName || FALLBACK_AUTHOR}
              </p>
              <h2>{form.title || "Your post title appears here"}</h2>
              <p>
                {form.content ||
                  "Your content preview will appear while you are typing."}
              </p>
              <div>
                {form.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
                  .slice(0, 4)
                  .map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
