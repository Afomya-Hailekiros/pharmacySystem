// app/dashboard/admin/page.tsx
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Users, Pill, BarChart3 } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CreateUserButton from "@/components/dashboard/CreateUserButton";

export default async function AdminDashboard() {
  const jwt = (await cookies()).get("jwt")?.value;
  const role = (await cookies()).get("role")?.value;

  if (!jwt || role !== "admin") redirect("/unauthorized");

  const cards = [
    { title: "Total Users", value: "12", icon: Users },
    { title: "Medicines in Stock", value: "234", icon: Pill },
    { title: "Weekly Sales", value: "$4,520", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-blue-700">Admin Dashboard</h1>
        <CreateUserButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <DashboardCard key={c.title} {...c} />
        ))}
      </div>
    </div>
  );
}
