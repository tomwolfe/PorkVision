import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PorkVision | Transparent Governance Auditor",
  description: "Audit government legislation and spending with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
