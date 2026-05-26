"use client";

import { type FormEvent, useState } from "react";
import { api } from "@/lib/axios";

type SearchUser = {
  _id: string;
  username: string;
  bio?: string;
};

type SearchPost = {
  _id: string;
  title: string;
  content?: string;
  tags?: string[];
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await api.get("/search", {
        params: {
          query,
          type: type || undefined,
        },
      });

      setUsers(res.data.users || []);
      setPosts(res.data.posts || []);
    } catch (error) {
      console.log("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-5 text-3xl font-bold">Search</h1>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Search user, post, tag..."
          className="flex-1 rounded-lg border p-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border p-2"
        >
          <option value="">All</option>
          <option value="user">Users</option>
          <option value="post">Posts</option>
        </select>

        <button className="rounded-lg bg-black px-4 py-2 text-white">
          Search
        </button>
      </form>

      {loading && <p>Đang tìm...</p>}

      {!loading && (
        <div className="space-y-6">
          <div>
            <h2 className="mb-2 font-bold">Users</h2>

            {users.length === 0 ? (
              <p className="text-sm text-gray-500">No users found.</p>
            ) : (
              users.map((user) => (
                <div key={user._id} className="mb-2 rounded-lg border p-3">
                  <a
                    className="font-semibold transition hover:text-[#6f7e5b]"
                    href={`/users/${user._id}`}
                  >
                    {user.username}
                  </a>
                  {user.bio && (
                    <p className="text-sm text-gray-500">{user.bio}</p>
                  )}
                </div>
              ))
            )}
          </div>

          <div>
            <h2 className="mb-2 font-bold">Posts</h2>

            {posts.length === 0 ? (
              <p className="text-sm text-gray-500">No posts found.</p>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="mb-2 rounded-lg border p-3">
                  <p className="font-semibold">{post.title}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {post.content}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {post.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-gray-100 px-2 py-1 text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </main>
  );
}
