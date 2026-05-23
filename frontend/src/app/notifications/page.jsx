"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { api } from "@/lib/axios";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch (error) {
      console.log("Fetch notifications error:", error);
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

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, []);

  if (loading) {
    return <main className="mx-auto max-w-2xl p-6">Đang tải thông báo...</main>;
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notifications</h1>

        <button
          onClick={markAllAsRead}
          className="rounded-lg bg-black px-4 py-2 text-sm text-white"
        >
          Mark all as read
        </button>
      </div>

      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item._id}
              className={`rounded-lg border p-4 ${
                item.isRead ? "bg-white" : "bg-blue-50"
              }`}
            >
              <p>
                <b>{item.sender?.username || "Someone"}</b>{" "}
                {item.message || item.type}
              </p>

              {item.post?.title && (
                <p className="mt-1 text-sm text-gray-500">
                  Post: {item.post.title}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
