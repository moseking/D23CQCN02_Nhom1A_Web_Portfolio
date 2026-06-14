import "./globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import AuthProvider from "../components/providers/AuthProvider";
import SocketClient from "../components/providers/SocketClient";

export const metadata: Metadata = {
  title: {
    default: "Artfolio | Creative Portfolio Platform",
    template: "%s | Artfolio",
  },
  description:
    "Artfolio is a creative portfolio platform for sharing design, illustration, photography, and digital artwork.",
  keywords: [
    "portfolio",
    "creative portfolio",
    "design",
    "ui ux",
    "illustration",
    "photography",
    "digital art",
  ],
  authors: [{ name: "D23CQCN02_Nhom1A" }],
  openGraph: {
    title: "Artfolio | Creative Portfolio Platform",
    description:
      "Showcase creative works, follow creators, and interact with the community in realtime.",
    type: "website",
    locale: "vi_VN",
    siteName: "Artfolio",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <SocketClient />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
