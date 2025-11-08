// Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Pill,
  BarChart,
  Boxes,
  FlaskConical,
  Layers,
  CircleDot,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/medicines", label: "Medicines", icon: Pill },
    { href: "/dashboard/admin/UOM", label: "UOM", icon: Boxes },
    { href: "/dashboard/admin/dosages", label: "Dosage", icon: FlaskConical },
    { href: "/dashboard/admin/categories", label: "Category", icon: Layers },
    { href: "/dashboard/admin/generics", label: "Generic", icon: CircleDot },
    { href: "/dashboard/admin/reports", label: "Reports", icon: BarChart },
    { href: "/dashboard/admin/sales", label: "Sales", icon: Package },
  ];

  return (
    <nav className="flex flex-col space-y-2 mt-4 md:mt-0">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-green-300 dark:hover:bg-green-700 transition-colors duration-300",
            pathname === href &&
              "bg-green-400 dark:bg-green-600 text-black dark:text-white font-semibold"
          )}
          onClick={() => setIsOpen && setIsOpen(false)} // close sidebar on mobile
        >
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}
    </nav>
  );
};
