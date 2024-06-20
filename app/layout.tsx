import type { Metadata } from "next";
import { Montserrat as Inter} from "next/font/google";
import { Analytics } from "@vercel/analytics/react"
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GroqVoice",
  description: "Realtime Transcription Powered by Groq",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
