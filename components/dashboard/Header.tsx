"use client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export const Header = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <header className="flex justify-between items-center bg-white border-b px-6 py-3 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-700">Dashboard</h1>
      <Button variant="outline" className="flex items-center gap-2 bg-red-500" onClick={handleLogout}>
        <LogOut size={18} /> Logout
      </Button>
    </header>
  );
};
