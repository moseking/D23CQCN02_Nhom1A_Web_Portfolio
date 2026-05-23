"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { FiAlertCircle, FiArrowLeft, FiImage, FiLink, FiSend, FiStar, FiUpload } from "react-icons/fi";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const FALLBACK_AUTHOR = "nhuquynh";
const DEFAULT_PREVIEW =
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80";

const initialForm = {
  title: "",
  content: "",
  authorName: FALLBACK_AUTHOR,
  imageUrl: "",
  uploadedImage: "",
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
      return parsedUser.username || parsedUser.name || parsedUser.fullName || FALLBACK_AUTHOR;
    } catch {
      return rawUser;
    }
  }

  return localStorage.getItem("username") || FALLBACK_AUTHOR;
}

function isLikelyImageUrl(value) {
  return /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(value) || value.startsWith("data:image/");
}

function getUsableImageUrl(value) {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "";
  if (isLikelyImageUrl(trimmedValue)) return trimmedValue;

  try {
    const url = new URL(trimmedValue);
    const imageParamNames = ["mediaurl", "imgurl", "imageurl", "url", "rurl", "u"];

    for (const name of imageParamNames) {
      const candidate = url.searchParams.get(name);
      if (candidate && isLikelyImageUrl(candidate)) {
        return candidate;
      }
    }

    return "";
  } catch {
    return "";
  }
}

export default function CreatePostPage() {
  const [form, setForm] = useState(() => ({
    ...initialForm,
    authorName: getCurrentUsername(),
  }));
  const [imageMode, setImageMode] = useState("url");
  const [error, setError] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const urlImage = useMemo(() => getUsableImageUrl(form.imageUrl), [form.imageUrl]);

  const previewImage = useMemo(() => {
    if (imageMode === "upload" && form.uploadedImage) return form.uploadedImage;
    if (urlImage) return urlImage;
    return DEFAULT_PREVIEW;
  }, [form.uploadedImage, imageMode, urlImage]);

  const hasUnsupportedImageUrl = imageMode === "url" && form.imageUrl.trim() && !urlImage;

  const updateField = (field, value) => {
    if (field === "imageUrl") {
      setPreviewError(false);
    }
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setError("");
      updateField("uploadedImage", reader.result);
      setImageMode("upload");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const imageValue = imageMode === "upload" ? form.uploadedImage : urlImage;
    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const media = imageValue
      ? [
          {
            url: imageValue,
            type: "image",
          },
        ]
      : [];

    try {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          content: form.content.trim(),
          authorName: form.authorName.trim() || FALLBACK_AUTHOR,
          tags,
          media,
          status: "published",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Create post failed");
      }

      window.location.href = "/feed";
    } catch (requestError) {
      setError(requestError.message);
      setIsSubmitting(false);
    }
  };

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
            Compose a polished portfolio post, attach an image by URL or from your computer, then
            publish it straight to the feed.
          </p>
        </aside>

        <div className="create-card reveal">
          <form className="composer-form" onSubmit={handleSubmit}>
            <div className="field-grid two">
              <label>
                <span>Title</span>
                <input
                  minLength={3}
                  onChange={(event) => updateField("title", event.target.value)}
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
                  onChange={(event) => updateField("authorName", event.target.value)}
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
                onChange={(event) => updateField("content", event.target.value)}
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
                      onChange={(event) => updateField("imageUrl", event.target.value)}
                      placeholder="https://example.com/work.jpg"
                      type="url"
                      value={form.imageUrl}
                    />
                  </div>
                  {hasUnsupportedImageUrl && (
                    <small className="image-url-help">
                      Link này là trang web/search page. Hãy bấm chuột phải vào ảnh rồi chọn
                      “Copy image address”, hoặc mở ảnh và copy link có đuôi .jpg, .png, .webp.
                    </small>
                  )}
                  {urlImage && urlImage !== form.imageUrl.trim() && (
                    <small className="image-url-help success">
                      Đã tự lấy link ảnh thật từ URL bạn dán.
                    </small>
                  )}
                </label>
              ) : (
                <label className="upload-drop">
                  <FiUpload />
                  <strong>Choose image from your computer</strong>
                  <small>PNG, JPG, WebP. The preview is saved with the post.</small>
                  <input accept="image/*" onChange={handleImageUpload} type="file" />
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

            <button className="primary-button publish-button gap-3" disabled={isSubmitting} type="submit">
              <FiSend /> {isSubmitting ? "Publishing..." : "Publish Post"}
            </button>
          </form>

          <article className="post-preview">
            <div className="preview-image">
              {hasUnsupportedImageUrl || previewError ? (
                <div className="preview-placeholder">
                  <FiAlertCircle />
                  <strong>Chưa đọc được ảnh từ link này</strong>
                  <span>Dán direct image URL hoặc dùng Upload từ máy.</span>
                </div>
              ) : (
                <img
                  alt="Post preview"
                  onError={() => setPreviewError(true)}
                  src={previewImage}
                />
              )}
            </div>
            <div className="preview-body">
              <p className="preview-author">{form.authorName || FALLBACK_AUTHOR}</p>
              <h2>{form.title || "Your post title appears here"}</h2>
              <p>{form.content || "Your content preview will appear while you are typing."}</p>
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
