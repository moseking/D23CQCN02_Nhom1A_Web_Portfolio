import "./globals.css";

export const metadata = {
  title: "Artfolio | Creative Portfolio Platform",
  description: "Explore creative works and trending creators.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
