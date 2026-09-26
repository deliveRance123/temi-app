import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Temitope — Personal English Teacher & Reader",
  description:
    "A loving, personal AI English teacher and book reader built specifically for Temitope.",
  manifest: "/manifest.json",
  icons: {
    icon: "/assets/temitope-brand.png",
    apple: "/assets/temitope-brand.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/temitope-brand.png" />
        <link rel="apple-touch-icon" href="/assets/temitope-brand.png" />
      </head>
      <body className="antialiased selection:bg-amber-400 selection:text-slate-900">
        {children}
      </body>
    </html>
  );
}
