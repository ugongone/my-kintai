import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyKintai - 勤怠管理アプリ",
  description: "シンプルな勤怠管理アプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
