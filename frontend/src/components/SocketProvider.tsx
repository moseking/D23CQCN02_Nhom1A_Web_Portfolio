"use client";

import { useEffect } from "react";
import { socket } from "../lib/socket";

type SocketUser = {
  _id?: string;
  id?: string;
} | null;

export default function SocketProvider({ user }: { user: SocketUser }) {
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
