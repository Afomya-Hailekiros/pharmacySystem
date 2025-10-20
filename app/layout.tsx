import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import ClientRedirect from "@/components/ClientRedirect";

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
          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
