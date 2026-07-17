import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "CopyForge AI - AI-Powered Marketing Copy Generator",
  description: "Generate high-converting marketing copy in seconds with AI. Social media posts, emails, ads, product descriptions & more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
