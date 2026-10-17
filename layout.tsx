import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shaloms AI — Learn smarter. Practice better.",
  description: "An AI study companion for Rwandan students studying Mathematics and Physics.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}