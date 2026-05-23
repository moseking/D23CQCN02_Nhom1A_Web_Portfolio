"use client";

import { useState } from "react";

export default function UploadTestPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChooseFile = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUploadedUrl("");

    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Chọn ảnh/video trước nha");
      return;
    }

    const formData = new FormData();
    formData.append("media", file);

    try {
      setLoading(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setUploadedUrl(data.url);
      alert("Upload thành công!");
    } catch (error) {
      console.log(error);
      alert("Upload lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isVideo = file?.type?.startsWith("video");

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-5">Upload Test</h1>

      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleChooseFile}
        className="mb-4"
      />

      {preview && (
        <div className="mb-4">
          {isVideo ? (
            <video src={preview} controls className="w-full rounded-lg" />
          ) : (
            <img src={preview} alt="Preview" className="w-full rounded-lg" />
          )}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded-lg"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {uploadedUrl && (
        <div className="mt-5">
          <p className="font-bold">Uploaded URL:</p>
          <a
            href={uploadedUrl}
            target="_blank"
            className="text-blue-600 underline break-all"
          >
            {uploadedUrl}
          </a>
        </div>
      )}
    </main>
  );
}
