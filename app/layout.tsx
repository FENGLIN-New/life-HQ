import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life HQ - 自動化人生操作系統",
  description: "Context-Aware AI Workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}