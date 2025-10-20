// app/dashboard/pharmacist/page.tsx
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ShoppingCart, Pill, ClipboardList } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PharmacistDashboard() {
  const jwt = (await cookies()).get("jwt")?.value;
  const role = (await cookies()).get("role")?.value;

  if (!jwt || (role !== "pharmacist" && role !== "admin")) redirect("/unauthorized");

  const cards = [
    { title: "Today’s Sales", value: "$1,240", icon: ShoppingCart },
    { title: "Available Medicines", value: "220", icon: Pill },
    { title: "Pending Orders", value: "8", icon: ClipboardList },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((c) => (
        <DashboardCard key={c.title} {...c} />
      ))}
    </div>
  );
}
