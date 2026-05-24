"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";

import {
  adminService,
} from "../../services/adminService";

import ActionButton
  from "./ActionButton";

import Avatar
  from "./Avatar";

import Badge
  from "./Badge";

import ConfirmModal
  from "./ConfirmModal";

import SearchBar
  from "./SearchBar";

import type {
  Comment,
} from "../../types/admin";

export default function CommentsTab() {
  const [comments, setComments] =
    useState<Comment[]>([]);

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
    fetchComments();
  }, []);

  const fetchComments =
    async () => {
      try {
        setLoading(true);

        const data =
          await adminService.getComments();

        setComments(
          data.comments || []
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

  const toggleVisibility =
    async (id: string) => {
      try {
        await adminService.toggleCommentVisibility(
          id
        );

        fetchComments();
      } catch (error) {
        console.log(error);
      }
    };

  const deleteComment =
    async (id: string) => {
      try {
        await adminService.deleteComment(
          id
        );

        fetchComments();
      } catch (error) {
        console.log(error);
      }
    };

  const filtered =
    comments.filter(
      (c) =>
        c.content
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        c.authorName
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
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
        Loading comments...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <div className="w-full max-w-sm">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search comments..."
          />
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              className="
                border-b
                border-[#E5E7E1]
                bg-[#F9FAF8]
              "
            >
              <tr>
                <th
                  className="
                    px-6
                    py-4
                    text-left
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-[#6B7280]
                  "
                >
                  Author
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-left
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-[#6B7280]
                  "
                >
                  Content
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-left
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-[#6B7280]
                  "
                >
                  Status
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-right
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-[#6B7280]
                  "
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(
                (comment) => (
                  <tr
                    key={
                      comment._id
                    }
                    className="
                      border-b
                      border-[#F3F4F6]
                      transition-colors
                      hover:bg-[#FAFBF8]
                    "
                  >
                    <td className="px-6 py-4">
                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >
                        <Avatar
                          initials={(comment.authorName || "?")
                            .charAt(0)
                            .toUpperCase()}
                        />

                        <div>
                          <p
                            className="
                              text-sm
                              font-medium
                              text-[#2C2C2C]
                            "
                          >
                            {comment.authorName}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p
                        className="
                          max-w-md
                          text-sm
                          text-[#4B5563]
                        "
                      >
                        {
                          comment.content
                        }
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          comment.visible
                            ? "success"
                            : "muted"
                        }
                      >
                        {comment.visible
                          ? "Visible"
                          : "Hidden"}
                      </Badge>
                    </td>

                    <td
                      className="
                        px-6
                        py-4
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-end
                          gap-2
                        "
                      >
                        <ActionButton
                          icon={
                            comment.visible
                              ? EyeOff
                              : Eye
                          }
                          label="Toggle Visibility"
                          onClick={() =>
                            toggleVisibility(
                              comment._id
                            )
                          }
                        />

                        <ActionButton
                          icon={
                            Trash2
                          }
                          label="Delete"
                          variant="danger"
                          onClick={() =>
                            setConfirm({
                              msg:
                                "Delete this comment?",

                              action:
                                () =>
                                  deleteComment(
                                    comment._id
                                  ),
                            })
                          }
                        />
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirm && (
        <ConfirmModal
            message={confirm.msg}
            onCancel={() =>
                setConfirm(null)
            }
            onConfirm={() => {
                confirm.action();

                setConfirm(null);
            }}
            />
      )}
    </div>
  );
}
