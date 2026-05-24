"use client";

import { useEffect, useState } from "react";

import {
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";

import { adminService } from "../../services/adminService";

import ActionButton from "./ActionButton";
import Badge from "./Badge";
import ConfirmModal from "./ConfirmModal";
import SearchBar from "./SearchBar";

import type { Post } from "../../types/admin";

export default function PostsTab() {
  const [posts, setPosts] =
    useState<Post[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [confirm, setConfirm] =
    useState<{
      msg: string;
      action: () => void;
    } | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const data =
        await adminService.getPosts();

      setPosts(data.posts || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility =
    async (id: string) => {
      try {
        await adminService.togglePostVisibility(
          id
        );

        fetchPosts();
      } catch (error) {
        console.log(error);
      }
    };

  const deletePost = async (
    id: string
  ) => {
    try {
      await adminService.deletePost(
        id
      );

      fetchPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const getAuthorName = (post: Post) =>
    post.author?.username ||
    post.authorName ||
    "Unknown";

  const filtered = posts.filter(
  (p) =>
    p.title
      .toLowerCase()
      .includes(search.toLowerCase()) ||

    getAuthorName(p)
      .toLowerCase()
      .includes(search.toLowerCase())
);

  if (loading) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-[#E5E7E1]
          bg-white
          p-6
          text-sm
          text-[#6B7280]
        "
      >
        Loading posts...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {confirm && (
        <ConfirmModal
          message={confirm.msg}
          onConfirm={() => {
            confirm.action();

            setConfirm(null);
          }}
          onCancel={() =>
            setConfirm(null)
          }
        />
      )}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search posts..."
          />
        </div>

        <div
          className="
            rounded-xl
            border
            border-[#E5E7E1]
            bg-[#F6F7F2]
            px-3
            py-2
            text-xs
            text-[#6B7280]
          "
        >
          {filtered.length} posts
        </div>
      </div>

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-[#E5E7E1]
          bg-white
        "
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              className="
                border-b
                border-[#E5E7E1]
                bg-[#F6F7F2]
              "
            >
              <th className="px-5 py-3 text-left">
                Title
              </th>

              <th className="px-4 py-3 text-left">
                Author
              </th>

              <th className="px-4 py-3 text-left">
                Tags
              </th>

              <th className="px-4 py-3 text-left">
                Status
              </th>

              <th className="px-5 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody
            className="
              divide-y
              divide-[#F3F4F6]
            "
          >
            {filtered.map((post) => (
              <tr
                key={post._id}
                className="
                  hover:bg-[#FAFAF8]
                "
              >
                <td className="px-5 py-4">
                  <div>
                    <p
                      className="
                        font-medium
                        text-[#2C2C2C]
                      "
                    >
                      {post.title}
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-xs
                        text-[#9CA3AF]
                      "
                    >
                      {post.createdAt}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <p
                    className="
                      text-sm
                      text-[#4B5563]
                    "
                  >
                    {getAuthorName(post)}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {(post.tags?.length
                      ? post.tags
                      : ["Portfolio"]
                    )
                      .slice(0, 3)
                      .map((tag) => (
                        <Badge
                          key={tag}
                          variant="muted"
                        >
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </td>

                <td className="px-4 py-4">
                  <Badge
                    variant={
                      post.visible
                        ? "success"
                        : "warning"
                    }
                  >
                    {post.visible
                      ? "Visible"
                      : "Hidden"}
                  </Badge>
                </td>

                <td className="px-5 py-4">
                  <div
                    className="
                      flex
                      items-center
                      justify-end
                      gap-1
                    "
                  >
                    <ActionButton
                      icon={
                        post.visible
                          ? EyeOff
                          : Eye
                      }
                      label={
                        post.visible
                          ? "Hide post"
                          : "Show post"
                      }
                      onClick={() =>
                        toggleVisibility(
                          post._id
                        )
                      }
                    />

                    <ActionButton
                      icon={Trash2}
                      label="Delete post"
                      variant="danger"
                      onClick={() =>
                        setConfirm({
                          msg: `Delete ${post.title}?`,
                          action: () =>
                            deletePost(
                              post._id
                            ),
                        })
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div
            className="
              py-16
              text-center
            "
          >
            <p
              className="
                text-sm
                text-[#9CA3AF]
              "
            >
              No posts found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
