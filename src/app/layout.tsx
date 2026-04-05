import type { Metadata } from "next";
import Script from "next/script";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const dmMono = DM_Mono({
  weight: ["300", "400"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Sledix — Мониторинг конкурентов в реальном времени",
  description: "Автономно отслеживайте цены, найм, отзывы и месседжинг ваших конкурентов. Получайте структурированные инсайты ежедневно.",
  keywords: ["мониторинг конкурентов", "анализ рынка", "SaaS аналитика", "Sledix"],
  authors: [{ name: "Sledix Team" }],
  openGraph: {
    title: "Sledix — Узнайте всё о своих конкурентах",
    description: "Автономная платформа для конкурентной разведки.",
    url: "https://sledix.tech",
    siteName: "Sledix",
    images: [
      {
        url: "/icon.svg", // Сделай картинку 1200x630 и положи в public
        width: 1200,
        height: 630,
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080809]">
        {children}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive" 
        />
      </body>

      <GoogleAnalytics gaId="G-7QX73392SW" />
    </html>
  );
}