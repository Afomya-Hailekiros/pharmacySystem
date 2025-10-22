"use client";

import { useEffect, useState } from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Users, Pill, BarChart3, List } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

// Types
interface Category {
  _id: string;
  name: string;
  description: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [jwt, setJwt] = useState<string | null>(null);

  const BASE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/category";

  // Load JWT from cookies
  useEffect(() => {
    const getCookie = (name: string) => {
      const matches = document.cookie.match(
        new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)")
      );
      return matches ? decodeURIComponent(matches[1]) : undefined;
    };

    setJwt(getCookie("jwt") || null);
  }, []);

  // Fetch categories to get count
  const fetchCategories = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(BASE_URL, { headers: { Authorization: `Bearer ${jwt}` } });
      setCategories(res.data.data.categories || []);
    } catch (err) {
      toast({ title: "❌ Error", description: "Failed to fetch categories", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [jwt]);

  return (
    <div className="space-y-6 p-6">
      <Toaster />

      <h1 className="text-2xl font-semibold text-blue-700">Admin Dashboard</h1>

      {/* Dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard title="Total Users" value="12" icon={Users} />
        <DashboardCard title="Medicines in Stock" value="234" icon={Pill} />
        <DashboardCard title="Weekly Sales" value="$4,520" icon={BarChart3} />

        {/* Categories card: shows count and navigates on click */}
        <div
          onClick={() => router.push("/dashboard/admin/categories")}
          className="cursor-pointer hover:shadow-lg transition"
        >
          <DashboardCard
            title="Categories"
            value={categories.length.toString()} // shows number of categories
            icon={List}
          />
        </div>
      </div>
    </div>
  );
}
