import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "cuckchair.review",
  description: "Next.js static deployment test",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
