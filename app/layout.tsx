import "./globals.css";
import SupabaseProvider from "@/lib/supabase/SupabaseProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import Scroll from "../components/Scroll";

const inter = Inter({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskBothy – Organize Ambition. Achieve Without Limits.",
  description:
    "TaskBothy helps teams and leaders turn vision into reality. Collaborate, manage projects, and unlock new productivity heights — from anywhere in the world.",
  keywords: [
    "TaskBothy",
    "task management",
    "project management",
    "kanban board",
    "team collaboration",
    "Trello alternative",
    "workflow management",
  ],
  openGraph: {
    title: "TaskBothy – Organize Ambition. Achieve Without Limits.",
    description:
      "Streamlined tools to unite your team and deliver with elegance. Smart Planning, Seamless Connection, Instant Response.",
    url: "https://taskbothyapp.vercel.app/",
    siteName: "TaskBothy",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          <SupabaseProvider>
            <Scroll/>
            {children}
          </SupabaseProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
