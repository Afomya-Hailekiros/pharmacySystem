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
  viewport: "width=device-width, initial-scale=1", // crucial for mobile responsiveness
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white min-h-screen w-full overflow-x-hidden">
        {/* 
          - bg-white sets a proper background instead of black on mobile 
          - min-h-screen ensures body always fills viewport height 
          - overflow-x-hidden prevents horizontal scroll issues 
        */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientRedirect />
          <div className="flex flex-col min-h-screen w-full">
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
