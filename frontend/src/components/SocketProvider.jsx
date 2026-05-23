"use client";

import { useEffect } from "react";
import { socket } from "../lib/socket";

export default function SocketProvider({ user }) {
  useEffect(() => {
    const userId = user?._id || user?.id;

    if (!userId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("add_user", userId);

    return () => {
      socket.disconnect();
    };
  }, [user?._id, user?.id]);

  return null;
}
