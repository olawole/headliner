import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthInitializer } from "@/components/auth/auth-initializer";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { UserMenu } from "@/components/auth/user-menu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Headliner — AI Live Intelligence, Face to Face",
  description:
    "Choose your AI expert. Start a face-to-face conversation powered by real-time data and live search.",
  keywords: [
    "AI research assistant",
    "live intelligence",
    "AI avatar",
    "real-time search",
    "financial analyst AI",
    "news AI",
    "academic research AI",
    "face to face AI",
    "Tavus",
    "Valyu",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "Headliner — AI Live Intelligence, Face to Face",
    description:
      "Choose your AI expert. Start a face-to-face conversation powered by real-time data and live search.",
    siteName: "Headliner",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Headliner — AI Live Intelligence, Face to Face",
    description:
      "Choose your AI expert. Start a face-to-face conversation powered by real-time data and live search.",
    creator: "@unicodeveloper",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} min-h-screen bg-gray-950 text-white antialiased`}
      >
        <AuthInitializer>
          {children}
          <UserMenu />
          <SignInModal />
        </AuthInitializer>
      </body>
    </html>
  );
}
