"use client";

import { useEffect, useState } from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Users, Pill, BarChart3, List } from "lucide-react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [jwt, setJwt] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // Category form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/category";

  // ✅ Load JWT and role from cookies (client-side only)
  useEffect(() => {
    const getCookie = (name: string) => {
      const matches = document.cookie.match(
        new RegExp(
          "(?:^|; )" +
            name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
            "=([^;]*)"
        )
      );
      return matches ? decodeURIComponent(matches[1]) : undefined;
    };

    const token = getCookie("jwt");
    const r = getCookie("role");

    setJwt(token || null);
    setRole(r || null);

    if (!token || r !== "admin") {
      toast({
        title: "⚠️ Unauthorized",
        description: "You must be an admin to access this page.",
        variant: "destructive",
      });
    }
  }, []);

  // ✅ Fetch categories
  const fetchCategories = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setCategories(res.data.data.categories || []);
      console.log("Categories fetched:", res.data.data.categories);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      toast({ title: "❌ Error", description: "Failed to fetch categories", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [jwt]);

  // ✅ Handle add/update category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jwt) return;

    setLoading(true);
    try {
      const url = editId ? `${BASE_URL}/${editId}` : BASE_URL;
      const method = editId ? "patch" : "post";

      const res = await axios({
        method,
        url,
        data: { name, description },
        headers: { Authorization: `Bearer ${jwt}` },
      });

      toast({
        title: "✅ Success",
        description: editId ? "Category updated!" : "Category created!",
        variant: "success",
      });

      setName("");
      setDescription("");
      setEditId(null);
      fetchCategories();
      console.log("Category saved:", res.data);
    } catch (err) {
      console.error("Failed to save category:", err);
      toast({ title: "❌ Error", description: "Failed to save category", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit category
  const handleEdit = (cat: Category) => {
    setEditId(cat._id);
    setName(cat.name);
    setDescription(cat.description || "");
  };

  // ✅ Delete category
  const handleDelete = async (id: string) => {
    if (!jwt) return;
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      toast({ title: "✅ Deleted", description: "Category deleted", variant: "success" });
      fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
      toast({ title: "❌ Error", description: "Failed to delete category", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Toaster /> {/* Toast container */}

      <h1 className="text-2xl font-semibold text-blue-700">Admin Dashboard</h1>

      {/* Dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard title="Total Users" value="12" icon={Users} />
        <DashboardCard title="Medicines in Stock" value="234" icon={Pill} />
        <DashboardCard title="Weekly Sales" value="$4,520" icon={BarChart3} />
        <DashboardCard title="Categories" value={categories.length.toString()} icon={List} />
      </div>

      {/* Category form */}
      <Card className="max-w-md shadow-md">
        <CardHeader>
          <CardTitle>{editId ? "Edit Category" : "Add Category"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category Name" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description..." />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : editId ? "Update" : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Category dropdown */}
      <Card className="max-w-md shadow-md">
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-black">No categories found.</p>
          ) : (
            <select className="w-full border p-2 rounded-md text-black">
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </CardContent>
      </Card>

      {/* Category list with edit/delete */}
      
    </div>
  );
}
