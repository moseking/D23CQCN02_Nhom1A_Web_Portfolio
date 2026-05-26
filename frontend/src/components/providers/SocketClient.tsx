"use client";

import SocketProvider from "../SocketProvider";
import { useAuthStore } from "../../store/authStore";

export default function SocketClient() {
  const user = useAuthStore((state) => state.user);

  return <SocketProvider user={user} />;
}
