"use client";

import { useEffect, useState } from "react";
import { socket } from "../../lib/socket";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.connect();

    socket.on("new_notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off("new_notification");
      socket.disconnect();
    };
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-5">Notifications</h1>

      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div key={item._id} className="border rounded-lg p-4">
              <p>
                <b>{item.sender?.username}</b> {item.type}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
