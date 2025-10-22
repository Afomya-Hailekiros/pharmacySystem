"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function CategoryList() {
  const [categories, setCategories] = useState<any[]>([]);
  const { toast } = useToast();
  const BASE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/category";

  const fetchCategories = async () => {
    try {
      const jwt = document.cookie
        .split("; ")
        .find((row) => row.startsWith("jwt="))
        ?.split("=")[1];

      console.log("Fetching categories... JWT:", jwt ? "✅ Found" : "❌ Missing");

      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${jwt}` },
        withCredentials: true,
      });

      console.log("Fetched categories:", res.data);

      if (res.status === 200 && res.data?.data?.categories) {
        setCategories(res.data.data.categories);
      } else {
        toast({
          title: "❌ Failed",
          description: res.data?.message || "Failed to load categories",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      toast({
        title: "⚠️ Error",
        description:
          err.response?.data?.message || "Network or auth issue occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const jwt = document.cookie
        .split("; ")
        .find((row) => row.startsWith("jwt="))
        ?.split("=")[1];

      console.log("Deleting category:", id, "| JWT:", jwt ? "✅ Found" : "❌ Missing");

      const res = await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
        withCredentials: true,
      });

      console.log("Delete response:", res.data);

      if (res.status === 204 || res.status === 200) {
        toast({
          title: "✅ Deleted",
          description: "Category deleted successfully.",
          variant: "success",
        });
        fetchCategories();
      } else {
        toast({
          title: "❌ Failed",
          description: res.data?.message || "Could not delete category.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error deleting category:", err);
      toast({
        title: "⚠️ Network Error",
        description:
          err.response?.data?.message || "Something went wrong. Check console.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Card className="bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-700">All Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories.length === 0 ? (
            <p className="text-gray-500">No categories found.</p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat._id}
                className="flex justify-between items-center p-3 border rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
              >
                <div>
                  <p className="font-medium text-blue-900">{cat.name}</p>
                  <p className="text-sm text-blue-800">{cat.description}</p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      (window.location.href = `/dashboard/admin/categories?edit=${cat._id}`)
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(cat._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ✅ Toast container */}
        <Toaster />
      </CardContent>
    </Card>
  );
}
