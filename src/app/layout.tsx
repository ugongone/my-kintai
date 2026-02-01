import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from 'next/font/google'
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp',
})

export const metadata: Metadata = {
  title: "MyKintai - 勤怠管理アプリ",
  description: "シンプルな勤怠管理アプリケーション",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MyKintai',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
      </head>
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
