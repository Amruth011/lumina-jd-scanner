import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lumina | AI-Powered ATS Resume Optimizer",
  description: "AI-powered ATS resume optimizer and job description analyzer. Bridge skill gaps and land top-tier roles.",
  keywords: ["ATS scanner", "resume optimizer", "job description analyzer", "AI career coach"],
  metadataBase: new URL("https://lumina.app"),
  openGraph: {
    title: "Lumina | AI-Powered ATS Resume Optimizer",
    description: "AI-powered ATS resume optimizer and job description analyzer. Bridge skill gaps and land top-tier roles.",
    url: "https://lumina.app",
    siteName: "Lumina",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumina | AI-Powered ATS Resume Optimizer",
    description: "AI-powered ATS resume optimizer and job description analyzer. Bridge skill gaps and land top-tier roles.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
