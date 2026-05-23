"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket";

export default function SocketProvider({ user }) {
  useEffect(() => {
    if (!user?._id) return;

    socket.connect();
    socket.emit("add_user", user._id);

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return null;
}
