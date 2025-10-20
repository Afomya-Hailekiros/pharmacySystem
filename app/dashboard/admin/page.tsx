"use client";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Users, Pill, BarChart3, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const cards = [
    { title: "Total Users", value: "12", icon: Users },
    { title: "Medicines in Stock", value: "234", icon: Pill },
    { title: "Weekly Sales", value: "$4,520", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-blue-700">Admin Dashboard</h1>

        <Button
          onClick={() => router.push("/signup")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <UserPlus size={18} />
          Create User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <DashboardCard key={c.title} {...c} />
        ))}
      </div>
    </div>
  );
}
