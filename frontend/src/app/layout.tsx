import "./globals.css";

import type { ReactNode } from "react";

import AuthProvider from "../components/providers/AuthProvider";
import SocketClient from "../components/providers/SocketClient";

export const metadata = {
  title: "Artfolio | Creative Portfolio Platform",
  description: "Explore creative works and trending creators.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <SocketClient />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
