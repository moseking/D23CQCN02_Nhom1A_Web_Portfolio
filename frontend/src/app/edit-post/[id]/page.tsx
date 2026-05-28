"use client";

/* eslint-disable @next/next/no-img-element */

import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheck,
  FiChevronDown,
  FiImage,
  FiLink,
  FiSave,
  FiStar,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { api } from "../../../lib/axios";
import { useAuthStore } from "../../../store/authStore";
import { socket } from "../../../lib/socket";

const FALLBACK_AUTHOR = "";
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const DEFAULT_PREVIEW =
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80";

type MediaType = "image" | "video";

type PostForm = {
  title: string;
  content: string;
  authorName: string;
  imageUrl: string;
  uploadedMedia: string;
  uploadedMediaType: MediaType;
  tags: string[];
};

type CategoryOption = {
  _id: string;
  name: string;
  slug?: string;
  postsCount?: number;
};

type ApiPost = {
  title?: string;
  content?: string;
  authorName?: string;
  media?: Array<{
    url?: string;
    type?: MediaType;
  }>;
  tags?: string[];
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
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
    return "File media quá lớn để lưu trực tiếp vào MongoDB. Hãy chọn video dưới 8MB hoặc dùng link video trực tiếp.";
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
      )
        return candidate;
    }
  } catch {
    return "";
  }

  return "";
}

export default function EditPostPage() {
  const params = useParams();
  const postId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<PostForm>({
    title: "",
    content: "",
    authorName: FALLBACK_AUTHOR,
    imageUrl: "",
    uploadedMedia: "",
    uploadedMediaType: "image",
    tags: [],
  });
  const [imageMode, setImageMode] = useState("url");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsFetchError, setTagsFetchError] = useState("");
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);
  const tagsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPost() {
      try {
        const response = await api.get(`/posts/${postId}`, {
          signal: controller.signal,
        });
        const result = response.data;

        if (!result.success) {
          throw new Error(result.message || "Cannot load post");
        }

        const post = result.data as ApiPost;
        const mediaUrl = post.media?.[0]?.url || "";
        const mediaType = post.media?.[0]?.type || getMediaType(mediaUrl);

        setForm({
          title: post.title || "",
          content: post.content || "",
          authorName: post.authorName || FALLBACK_AUTHOR,
          imageUrl: mediaUrl.startsWith("data:") ? "" : mediaUrl,
          uploadedMedia: mediaUrl.startsWith("data:") ? mediaUrl : "",
          uploadedMediaType: mediaType,
          tags: post.tags || [],
        });
        setImageMode(mediaUrl.startsWith("data:") ? "upload" : "url");
        setStatus("ready");
      } catch (requestError) {
        if (!controller.signal.aborted && !isAbortError(requestError)) {
          setError(getErrorMessage(requestError));
          setStatus("error");
        }
      }
    }

    if (postId) loadPost();
    return () => controller.abort();
  }, [postId]);

  const fetchCategories = useCallback(async () => {
    try {
      setTagsLoading(true);
      setTagsFetchError("");

      const response = await api.get("/posts/categories");
      setCategories(response.data.categories || []);
    } catch (requestError) {
      setTagsFetchError(getErrorMessage(requestError));
    } finally {
      setTagsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [fetchCategories, isAuthenticated]);

  useEffect(() => {
    if (!tagsDropdownOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        tagsDropdownRef.current &&
        !tagsDropdownRef.current.contains(event.target as Node)
      ) {
        setTagsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTagsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [tagsDropdownOpen]);

  const urlMedia = useMemo(
    () => getUsableMediaUrl(form.imageUrl),
    [form.imageUrl]
  );
  const previewMedia = useMemo(() => {
    if (imageMode === "upload" && form.uploadedMedia) return form.uploadedMedia;
    if (urlMedia) return urlMedia;
    return DEFAULT_PREVIEW;
  }, [form.uploadedMedia, imageMode, urlMedia]);
  const previewMediaType =
    imageMode === "upload"
      ? form.uploadedMediaType
      : getMediaType(previewMedia);
  const hasUnsupportedMediaUrl =
    imageMode === "url" && form.imageUrl.trim() && !urlMedia;
  const tagsDropdownDisabled =
    tagsLoading || Boolean(tagsFetchError) || categories.length === 0;
  const selectedTagsText = form.tags.length
    ? `${form.tags.length} tag${form.tags.length > 1 ? "s" : ""} selected`
    : "Select tags";

  const updateField = (field: Exclude<keyof PostForm, "tags">, value: string) => {
    if (field === "imageUrl") setPreviewError(false);
    setForm((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const removeSelectedTag = useCallback((tagToRemove: string) => {
    setForm((current) => ({
      ...current,
      tags: current.tags.filter((tag) => tag !== tagToRemove),
    }));
  }, []);

  const toggleSelectedTag = useCallback((tagName: string) => {
    setError("");

    setForm((current) => {
      const isSelected = current.tags.includes(tagName);

      return {
        ...current,
        tags: isSelected
          ? current.tags.filter((tag) => tag !== tagName)
          : [...current.tags, tagName],
      };
    });
  }, []);

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

    const reader = new FileReader();
    reader.onload = () => {
      setError("");
      setForm((current) => ({
        ...current,
        uploadedMedia: typeof reader.result === "string" ? reader.result : "",
        uploadedMediaType: file.type.startsWith("video/") ? "video" : "image",
      }));
      setImageMode("upload");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isAuthenticated) {
      setError("Please login to continue");
      return;
    }

    setIsSubmitting(true);

    const mediaValue = imageMode === "upload" ? form.uploadedMedia : urlMedia;
    const mediaType =
      imageMode === "upload"
        ? form.uploadedMediaType
        : getMediaType(mediaValue);

    if (
      mediaValue.startsWith("data:") &&
      mediaValue.length > MAX_UPLOAD_BYTES * 1.4
    ) {
      setError(
        `File media quá lớn. Upload từ máy chỉ hỗ trợ file dưới ${formatBytes(
          MAX_UPLOAD_BYTES
        )}; video lớn hãy dùng direct URL hoặc Cloudinary.`
      );
      setIsSubmitting(false);
      return;
    }
    const tags = form.tags
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!tags.length) {
      setError("Please choose at least one tag.");
      setIsSubmitting(false);
      return;
    }

    const media = mediaValue ? [{ url: mediaValue, type: mediaType }] : [];

    try {
      const response = await api.patch(`/posts/${postId}`, {
        title: form.title.trim(),
        content: form.content.trim(),
        tags,
        media,
        status: "published",
      });
      const result = response.data;

      if (!result.success) {
        throw new Error(result.message || "Update post failed");
      }

      socket.emit("post_updated", {
        post: result.data,
      });

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
          <p className="eyebrow">Edit Post</p>
          <h1>
            Refine Your <span>Creative Work</span>
          </h1>
          <p>
            Update the post details, swap the artwork, or polish the story. Your
            changes will appear on the feed after saving.
          </p>
        </aside>

        <div className="create-card reveal">
          {!isAuthenticated ? (
            <div className="form-empty-state">
              <h2>Please login to continue</h2>
              <p className="mt-3 text-slate-600">
                Public posts are viewable as a guest, but editing requires an
                account.
              </p>
              <a className="primary-button mt-6" href="/auth?mode=login">
                Login
              </a>
            </div>
          ) : status === "loading" ? (
            <div className="form-empty-state">Loading post...</div>
          ) : (
            <>
              <form className="composer-form" onSubmit={handleSubmit}>
                <div className="field-grid two">
                  <label>
                    <span>Title</span>
                    <input
                      minLength={3}
                      onChange={(event) =>
                        updateField("title", event.target.value)
                      }
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
                          Paste a direct image/video URL ending in .jpg, .png,
                          .webp, .mp4, or .webm.
                        </small>
                      )}
                    </label>
                  ) : (
                    <label className="upload-drop">
                      <FiUpload />
                      <strong>Choose a new image or video</strong>
                      <small>
                        PNG, JPG, WebP, MP4, WebM. Upload file dưới 8MB; video
                        lớn dùng URL.
                      </small>
                      <input
                        accept="image/*,video/*"
                        onChange={handleMediaUpload}
                        type="file"
                      />
                    </label>
                  )}
                </div>

                <div className="tag-field">
                  <span>Tags</span>
                  <div className="tag-dropdown" ref={tagsDropdownRef}>
                    <button
                      aria-expanded={tagsDropdownOpen}
                      className={`tag-dropdown-trigger ${
                        tagsDropdownOpen ? "open" : ""
                      }`}
                      disabled={tagsDropdownDisabled}
                      onClick={() =>
                        setTagsDropdownOpen((current) => !current)
                      }
                      type="button"
                    >
                      <span>{selectedTagsText}</span>
                      <FiChevronDown />
                    </button>

                    <div
                      className={`tag-dropdown-menu ${
                        tagsDropdownOpen ? "open" : ""
                      }`}
                    >
                      {categories.map((category) => {
                        const isSelected = form.tags.includes(category.name);

                        return (
                          <button
                            className={isSelected ? "selected" : ""}
                            key={category._id}
                            onClick={() => toggleSelectedTag(category.name)}
                            type="button"
                          >
                            <span>{category.name}</span>
                            {isSelected && <FiCheck />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <small className="tag-select-help">
                    {tagsLoading
                      ? "Loading tags..."
                      : tagsFetchError
                      ? `Could not load tags: ${tagsFetchError}`
                      : categories.length
                      ? "Choose one or more tags."
                      : "No tags are available yet."}
                  </small>
                  {form.tags.length > 0 && (
                    <div className="selected-tags">
                      {form.tags.map((tag) => (
                        <button
                          aria-label={`Remove ${tag}`}
                          key={tag}
                          onClick={() => removeSelectedTag(tag)}
                          type="button"
                        >
                          {tag}
                          <FiX />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {error && <p className="form-error">{error}</p>}

                <button
                  className="primary-button publish-button gap-3"
                  disabled={isSubmitting || status === "error"}
                  type="submit"
                >
                  <FiSave /> {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </form>

              <article className="post-preview">
                <div className="preview-image">
                  {hasUnsupportedMediaUrl || previewError ? (
                    <div className="preview-placeholder">
                      <FiAlertCircle />
                      <strong>Cannot preview this media link</strong>
                      <span>
                        Paste a direct image/video URL or upload from your
                        computer.
                      </span>
                    </div>
                  ) : previewMediaType === "video" ? (
                    <video controls src={previewMedia} />
                  ) : (
                    <img
                      alt="Post preview"
                      onError={() => setPreviewError(true)}
                      src={previewMedia}
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
                      .slice(0, 4)
                      .map((tag) => (
                        <span className="tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
              </article>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
