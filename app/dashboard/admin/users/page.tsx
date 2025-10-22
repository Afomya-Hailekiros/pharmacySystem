"use client";

import { useEffect, useState } from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Users, Pill, BarChart3, List, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast"; // ✅ use your toast provider
import { Toaster } from "@/components/ui/toaster";    // ✅ render toaster

interface Category {
  _id: string;
  name: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [jwt, setJwt] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Read cookies client-side
  useEffect(() => {
    const jwtCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("jwt="))
      ?.split("=")[1];
    const roleCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("role="))
      ?.split("=")[1];

    setJwt(jwtCookie || null);
    setRole(roleCookie || null);

    if (!jwtCookie || roleCookie !== "admin") {
      router.push("/unauthorized");
    }
  }, [router]);

  // ✅ Fetch categories
  const fetchCategories = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(
        "https://pharmacy-management-9ls6.onrender.com/api/v1/category",
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast({
        title: "Fetch Error",
        description: "Failed to load categories.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (jwt) fetchCategories();
  }, [jwt]);

  // ✅ Add new category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "https://pharmacy-management-9ls6.onrender.com/api/v1/category",
        { name: categoryName },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      toast({
        title: "Success",
        description: "Category added successfully!",
      });

      setCategoryName("");
      fetchCategories();
    } catch (error: any) {
      console.error("Error adding category:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to add category.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Dashboard cards
  const cards = [
    { title: "Total Users", value: "12", icon: Users },
    { title: "Medicines in Stock", value: "234", icon: Pill },
    { title: "Weekly Sales", value: "$4,520", icon: BarChart3 },
    { title: "Categories", value: categories.length.toString(), icon: List },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Renderer */}
      <Toaster />

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-blue-700">
          Admin Dashboard
        </h1>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card) => (
          <DashboardCard key={card.title} {...card} />
        ))}
      </div>

      {/* ✅ Category Form */}
      <div className="mt-8 p-6 border rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-blue-600" />
          Add New Category
        </h2>

        <form onSubmit={handleAddCategory} className="flex gap-3">
          <input
            type="text"
            placeholder="Enter category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      {/* ✅ Category List */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3 text-gray-700 flex items-center gap-2">
          <List className="w-5 h-5 text-blue-600" />
          Category List
        </h2>

        <ul className="space-y-2">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <li
                key={cat._id}
                className="p-3 border rounded-lg bg-white text-gray-700 flex justify-between items-center shadow-sm"
              >
                <span>{cat.name}</span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No categories found.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
