"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Pill, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/medicines", label: "Medicines", icon: Pill },
    { href: "/dashboard/admin/reports", label: "Reports", icon: BarChart },
  ];

  return (
    <aside className="w-64 bg-white border-r shadow-sm p-4 flex flex-col">
      <h2 className="text-2xl font-bold mb-8 text-black">Pharma Admin</h2>
      <nav className="flex flex-col space-y-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-black hover:bg-green-300 transition",
              pathname === href && "bg-green-400 text-black font-semibold"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
