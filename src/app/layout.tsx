import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { profile } from "@/content/profile";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const code = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
});

const description = `${profile.title} focused on ${profile.focus}. ${profile.headline}`;

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.title}`,
  description,
  openGraph: {
    title: `${profile.name} — ${profile.title}`,
    description,
    type: "profile",
  },
};

export const viewport: Viewport = {
  themeColor: "#07090d",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.title,
  email: `mailto:${profile.email}`,
  sameAs: [profile.linkedin],
  address: { "@type": "PostalAddress", addressLocality: "South Tangerang", addressCountry: "ID" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${code.variable} antialiased`}>
      <body className="min-h-full">
        <script
          type="application/ld+json"
          // Static data from our own content file, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
