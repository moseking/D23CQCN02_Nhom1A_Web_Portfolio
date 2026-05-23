"use client";

import { useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/search?query=${query}`
      );

      const data = await res.json();

      setUsers(data.users || []);
      setPosts(data.posts || []);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-5">Search</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 rounded-lg flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button className="bg-black text-white px-4 py-2 rounded-lg">
          Search
        </button>
      </form>

      <div className="space-y-6">
        <div>
          <h2 className="font-bold mb-2">Users</h2>

          {users.map((user) => (
            <div key={user._id} className="border rounded-lg p-3 mb-2">
              <p>{user.username}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="font-bold mb-2">Posts</h2>

          {posts.map((post) => (
            <div key={post._id} className="border rounded-lg p-3 mb-2">
              <p>{post.caption}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
