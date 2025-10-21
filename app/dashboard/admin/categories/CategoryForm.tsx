"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Lightweight fallback toast implementation to avoid depending on 'sonner'
const toast = {
  success: (msg: string) => {
    if (typeof window !== "undefined" && (window as any).toast?.success) {
      (window as any).toast.success(msg);
    } else {
      // fallback: log to console (or replace with alert/modal as desired)
      console.log("Success:", msg);
    }
  },
  error: (msg: string) => {
    if (typeof window !== "undefined" && (window as any).toast?.error) {
      (window as any).toast.error(msg);
    } else {
      console.error("Error:", msg);
    }
  },
};

export default function CategoryForm({ categoryId }: { categoryId?: string }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const BASE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/category";

  // If editing existing category
  useEffect(() => {
    if (categoryId) {
      fetch(`${BASE_URL}/${categoryId}`)
        .then((res) => res.json())
        .then((data) => {
          setName(data?.data?.category?.name || "");
          setDescription(data?.data?.category?.description || "");

        })
        .catch(() => toast.error("Failed to load category"));
    }
  }, [categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const method = categoryId ? "PATCH" : "POST";
    const url = categoryId ? `${BASE_URL}/${categoryId}` : BASE_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
        credentials: "include",

      });
      const data = await res.json();

      if (res.ok) {
        toast.success(categoryId ? "Category updated!" : "Category created!");
        setName("");
        setDescription("");
      } else {
        toast.error(data?.message || "Something went wrong");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md shadow-md">
      <CardHeader>
        <CardTitle>{categoryId ? "Edit Category" : "Add Category"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Antibiotic"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description..."
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : categoryId ? "Update" : "Create"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
