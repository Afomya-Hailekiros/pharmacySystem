"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast"; // optional toast

export const Header = () => {
  const router = useRouter();
  const { toast } = useToast(); // for optional logout toast

  const handleLogout = () => {
    // Delete cookies
    document.cookie = `jwt=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `role=; path=/; max-age=0; SameSite=Lax`;
    localStorage.removeItem("token");

    toast({
      title: "✅ Logged Out",
      description: "You have been logged out successfully.",
      variant: "success",
    });

    router.push("/login");
  };

  return (
    <header className="flex justify-between items-center bg-white border-b px-6 py-3 shadow-sm">
      <h1 className="text-xl font-semibold text-black">Dashboard</h1>
      <Button
        onClick={handleLogout}
        className="
          flex items-center gap-2
          bg-red-700 text-white font-bold
          border-none rounded-lg px-4 py-2
          hover:bg-red-600 hover:scale-105
          transition duration-200 ease-in-out
        "
      >
        <LogOut size={18} />
        Logout
      </Button>
    </header>
  );
};
