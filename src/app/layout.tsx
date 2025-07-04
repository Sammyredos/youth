import type { Metadata } from "next";
import "./globals.css";
import { TitleManager } from "@/components/TitleManager";
import { FaviconManager } from "@/components/FaviconManager";
import { ProgressBar } from "@/components/ProgressBar";
import { LanguageProvider } from "@/contexts/LanguageContext";


export const metadata: Metadata = {
  title: "Loading...", // Will be immediately replaced by TitleManager
  description: "Mopgomglobal accommodation registration and management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        {/* Prevent any default favicon loading - FaviconManager will handle everything */}
        <meta name="msapplication-config" content="none" />
      </head>
      <body className="font-apercu antialiased text-gray-900 bg-white" suppressHydrationWarning={true}>
        <LanguageProvider>
          <ProgressBar color="#4f46e5" height={3} />
          <TitleManager />
          <FaviconManager />
          {children}
        </LanguageProvider>
        {process.env.NODE_ENV === 'development' && (
          <div id="performance-monitor-root" />
        )}
      </body>
    </html>
  );
}
