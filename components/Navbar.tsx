"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="w-full bg-purple-600 text-white dark:bg-purple-900 shadow-md px-6 py-3 flex items-center justify-between">
      {/* Logo / Brand */}
      <Link href="/" className="text-lg font-bold">
        🎓 Student Admin
      </Link>

      {/* Links */}
      <div className="flex items-center gap-4">
        <Link href="/students" className="hover:underline">
          Students
        </Link>
        <Link href="/about" className="hover:underline">
          About
        </Link>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="rounded-full"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </div>
    </nav>
  );
}
