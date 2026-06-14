"use server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function searchContentAction(keyword: string) {
  const q = keyword.trim();

  if (!q) {
    return { users: [], posts: [] };
  }

  const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(q)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Search failed");
  }

  const json = await res.json();

  return json.data || { users: [], posts: [] };
}
