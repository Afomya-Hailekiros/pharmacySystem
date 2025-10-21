// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import ClientRedirect from "@/components/ClientRedirect";
import { ToastProvider } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Pharmacy Admin",
  description: "Pharmacy management system frontend",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientRedirect />
          {/* Wrap only client stuff in a div with "use client" */}
          <div>
            <ToastProvider>
              {children}
              <Toaster />
            </ToastProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
