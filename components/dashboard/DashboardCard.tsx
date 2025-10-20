import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  icon: LucideIcon;
}

export function DashboardCard({ title, value, icon: Icon }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-between hover:shadow-lg transition">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-2xl font-bold text-gray-800">{value}</h2>
      </div>
      <Icon className="text-green-600 h-10 w-10" />
    </div>
  );
}
