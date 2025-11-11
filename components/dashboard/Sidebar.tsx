"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  ChevronDown,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const pathname = usePathname();
  const [salesOpen, setSalesOpen] = useState(false);

  const links = [
    { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/medicines", label: "Medicines", icon: Pill },
    { href: "/dashboard/admin/UOM", label: "UOM", icon: Boxes },
    { href: "/dashboard/admin/dosages", label: "Dosage", icon: FlaskConical },
    { href: "/dashboard/admin/categories", label: "Category", icon: Layers },
    { href: "/dashboard/admin/generics", label: "Generic", icon: CircleDot },
    { href: "/dashboard/admin/reports", label: "Reports", icon: BarChart },
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
          onClick={() => setIsOpen && setIsOpen(false)}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}

      {/* Sales dropdown */}
      <div className="flex flex-col">
        <button
          onClick={() => setSalesOpen(!salesOpen)}
          className={cn(
            "flex items-center justify-between px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-green-300 dark:hover:bg-green-700 transition-colors duration-300",
            pathname.startsWith("/dashboard/admin/sales") &&
              "bg-green-400 dark:bg-green-600 text-black dark:text-white font-semibold"
          )}
        >
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5" />
            Sales
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${salesOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown links */}
        {salesOpen && (
          <div className="flex flex-col ml-6 mt-1 space-y-1">
            <Link
              href="/dashboard/admin/sales"
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-green-200 dark:hover:bg-green-700 transition-colors duration-200",
                pathname === "/dashboard/admin/sales" &&
                  "bg-green-300 dark:bg-green-600 text-black dark:text-white font-medium"
              )}
              onClick={() => setIsOpen && setIsOpen(false)}
            >
              <Package className="h-4 w-4" />
              All Sales
            </Link>
            <Link
              href="/dashboard/admin/sales/sales-report"
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-lg bg-yellow-100 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200 font-medium hover:bg-yellow-200 dark:hover:bg-yellow-600 transition-colors duration-200",
                pathname === "/dashboard/admin/sales/sales-report" &&
                  "bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white font-semibold"
              )}
              onClick={() => setIsOpen && setIsOpen(false)}
            >
              <FileText className="h-4 w-4" />
              Sales Report
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
