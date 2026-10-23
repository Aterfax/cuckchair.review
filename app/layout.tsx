import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import MainLayout from "./components/MainLayout";
// Route-only CSS modules are imported here (side-effect only) so their rules are
// hoisted into the shared CSS bundle instead of per-route chunk files. Next's
// route prefetching would otherwise preload those per-route CSS files during
// hydration, which Chrome logs as an unused-preload console warning on every page.
import "./components/ImageViewer.module.css";
import "./components/CuckGuessr.module.css";
import "./components/ReviewLayout.module.css";
import "./components/ScoreBadge.module.css";
import "./methodology/methodology.module.css";

// Self-hosted at build (static-export safe). Exposed as CSS variables that
// the token system in globals.css consumes. Space Grotesk carries display
// type, Inter carries body text, JetBrains Mono carries scores and spec data.
const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "cuckchair.review",
  description:
    "Independent cuck chair reviews scored as complete setups: the chair, the room around it, and its position in the scene — one weighted methodology.",
};

// Pre-paint theme restore: applies the visitor's stored vibe preset and
// accent palette to <html> before first paint so switching themes never
// flashes the default. try/catch keeps SSR/private-browsing safe (defaults
// apply when storage is unavailable).
const themeRestoreScript = `try{var t=localStorage.getItem('ccr.theme');var a=localStorage.getItem('ccr.accent');if(t)document.documentElement.dataset.theme=t;if(a)document.documentElement.dataset.accent=a;}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the pre-paint script sets data-theme/
    // data-accent on <html> before React hydrates; without suppression React
    // logs an attribute mismatch on every load.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable}`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeRestoreScript }} />
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
