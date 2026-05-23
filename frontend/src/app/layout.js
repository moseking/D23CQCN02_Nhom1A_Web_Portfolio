import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import AuthProvider from "../components/providers/AuthProvider";
import SocketClient from "../components/providers/SocketClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Artfolio | Creative Portfolio Platform",
  description: "Explore creative works and trending creators.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <SocketClient />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
