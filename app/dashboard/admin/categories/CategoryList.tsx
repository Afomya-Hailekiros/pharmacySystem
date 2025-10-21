"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const toast: { success: (msg: string) => void; error: (msg: string) => void } = {
  success: (msg: string) => {
    if (typeof window !== "undefined" && (window as any).toast?.success) {
      (window as any).toast.success(msg);
    } else {
      if (typeof window !== "undefined") window.alert(msg);
      else console.log("SUCCESS:", msg);
    }
  },
  error: (msg: string) => {
    if (typeof window !== "undefined" && (window as any).toast?.error) {
      (window as any).toast.error(msg);
    } else {
      if (typeof window !== "undefined") window.alert(msg);
      else console.error("ERROR:", msg);
    }
  },
};

export default function CategoryList() {
  const [categories, setCategories] = useState<any[]>([]);
  const BASE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/category";

  const fetchCategories = async () => {
    try {
     const res = await fetch(BASE_URL, {
     credentials: "include",
     });
      const data = await res.json();
      if (res.ok) {
        setCategories(data.data.categories);
      } else {
        toast.error("Failed to load categories");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

try {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (res.ok) {
    toast.success("Category deleted!");
    fetchCategories();
  } else {
    toast.error("Failed to delete");
  }
} catch {
  toast.error("Network error");
}
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories.length === 0 ? (
            <p className="text-gray-500">No categories found.</p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat._id}
                className="flex justify-between items-center p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-sm text-gray-500">{cat.description}</p>
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
      </CardContent>
    </Card>
  );
}
