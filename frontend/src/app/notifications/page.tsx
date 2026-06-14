"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiBell,
  FiCheckCircle,
  FiHeart,
  FiBookmark,
  FiMessageCircle,
  FiUserPlus,
} from "react-icons/fi";
import { socket } from "@/lib/socket";
import { api } from "@/lib/axios";

type NotificationItem = {
  _id: string;
  isRead?: boolean;
  message?: string;
  type?: string;
  createdAt?: string;
  sender?: {
    _id?: string;
    username?: string;
    avatar?: string;
  };
  post?: {
    _id?: string;
    title?: string;
  };
};

function getNotificationIcon(type?: string) {
  if (type === "like") return <FiHeart />;
  if (type === "save") return <FiBookmark />;
  if (type === "comment") return <FiMessageCircle />;
  if (type === "follow") return <FiUserPlus />;
  return <FiBell />;
}

function getNotificationLabel(type?: string) {
  if (type === "like") return "Like";
  if (type === "save") return "Save";
  if (type === "comment") return "Comment";
  if (type === "follow") return "Follow";
  if (type === "new_post") return "New Post";
  return "Activity";
}

function formatDate(date?: string) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.log("Fetch notifications error:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        }))
      );
    } catch (error) {
      console.log("Mark all as read error:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleNewNotification = (notification: NotificationItem) => {
      setNotifications((prev) => {
        const existed = prev.some((item) => item._id === notification._id);
        if (existed) return prev;
        return [notification, ...prev];
      });
    };

    socket.on("new_notification", handleNewNotification);
    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("notification", handleNewNotification);
    };
  }, []);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <main className="notifications-page min-h-screen bg-[#f7f8f3] px-6 py-24 text-[#252525] sm:px-10">
      <section className="mx-auto max-w-4xl">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="notification-kicker mb-3 text-xs font-black uppercase text-[#91a37d]">
              Activity Center
            </p>

            <h1 className="text-4xl font-bold tracking-normal sm:text-5xl">
              Notifications
            </h1>

            <p className="mt-3 text-base text-slate-600">
              Keep track of likes, comments, saves and follows on your creative
              works.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#9caf88] px-5 py-3 text-sm font-bold text-[#647657] transition hover:-translate-y-0.5 hover:bg-[#eef3e8]"
          >
            <FiArrowLeft />
            Back Home
          </Link>
        </div>

        <div className="mb-6 rounded-[28px] border border-[#e0e3da] bg-white/80 p-5 shadow-[0_18px_45px_rgba(41,45,36,0.08)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#eef3e8] text-xl text-[#7b8f68]">
                <FiBell />
              </span>

              <div>
                <strong className="block text-lg">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${
                        unreadCount > 1 ? "s" : ""
                      }`
                    : "All caught up"}
                </strong>
                <span className="text-sm text-slate-500">
                  {notifications.length} total activities
                </span>
              </div>
            </div>

            <button
              onClick={markAllAsRead}
              disabled={notifications.length === 0 || unreadCount === 0}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#252525] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-300"
              type="button"
            >
              <FiCheckCircle />
              Mark all as read
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-[#e0e3da] bg-white/80 p-10 text-center text-slate-500 shadow-[0_18px_45px_rgba(41,45,36,0.08)]">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-[28px] border border-[#e0e3da] bg-white/80 p-12 text-center shadow-[0_18px_45px_rgba(41,45,36,0.08)]">
            <span className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#eef3e8] text-2xl text-[#7b8f68]">
              <FiBell />
            </span>

            <h2 className="text-2xl font-bold">No notifications yet</h2>

            <p className="mx-auto mt-3 max-w-md text-slate-500">
              New activity from likes, comments, saves and follows will appear
              here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((item) => {
              const senderName = item.sender?.username || "Someone";
              const postTitle = item.post?.title;
              const targetHref =
                item.type === "follow" && item.sender?._id
                  ? `/users/${item.sender._id}`
                  : item.post?._id
                  ? `/posts/${item.post._id}`
                  : "/notifications";

              return (
                <Link
                  key={item._id}
                  href={targetHref}
                  className={`group block rounded-[24px] border p-5 shadow-[0_14px_35px_rgba(41,45,36,0.07)] transition hover:-translate-y-0.5 ${
                    item.isRead
                      ? "border-[#e0e3da] bg-white/75"
                      : "border-[#bfd0ad] bg-[#f0f6ea]"
                  }`}
                >
                  <div className="flex gap-4">
                    <span
                      className={`mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl ${
                        item.isRead
                          ? "bg-[#eef1ea] text-[#7b8f68]"
                          : "bg-[#9caf88] text-white"
                      }`}
                    >
                      {getNotificationIcon(item.type)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#7b8f68]">
                          {getNotificationLabel(item.type)}
                        </span>

                        {!item.isRead && (
                          <span className="rounded-full bg-[#7b8f68] px-2.5 py-1 text-xs font-bold text-white">
                            New
                          </span>
                        )}

                        {item.createdAt && (
                          <span className="text-xs font-semibold text-slate-400">
                            {formatDate(item.createdAt)}
                          </span>
                        )}
                      </div>

                      <p className="text-base leading-7 text-slate-700">
                        <strong className="font-bold text-[#252525]">
                          {senderName}
                        </strong>{" "}
                        {item.message || item.type || "sent you an activity"}
                      </p>

                      {postTitle && (
                        <span className="mt-3 inline-flex max-w-full rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-slate-600 transition group-hover:text-[#6f7e5b]">
                          <span className="truncate">Post: {postTitle}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
