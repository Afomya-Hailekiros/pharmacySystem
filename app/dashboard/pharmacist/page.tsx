import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { ShoppingCart, Pill, ClipboardList } from "lucide-react";

export default function PharmacistDashboard() {
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
