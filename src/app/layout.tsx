import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cyber Lab | IT & Cybersecurity Portfolio",
  description:
    "A personal portfolio documenting IT, networking, and cybersecurity projects.",
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