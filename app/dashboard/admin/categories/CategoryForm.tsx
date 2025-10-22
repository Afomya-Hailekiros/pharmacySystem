"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function CategoryForm({ categoryId }: { categoryId?: string }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const BASE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/category";

  // ✅ Fetch category if editing
  useEffect(() => {
    if (categoryId) {
      console.log("Fetching category with ID:", categoryId);
      axios
        .get(`${BASE_URL}/${categoryId}`, { withCredentials: true })
        .then((res) => {
          console.log("Fetched category data:", res.data);
          const cat = res.data?.data?.category;
          setName(cat?.name || "");
          setDescription(cat?.description || "");
        })
        .catch((err) => {
          console.error("Error fetching category:", err);
          toast({
            title: "⚠️ Failed to load category",
            description: err.response?.data?.message || "Error loading category",
            variant: "destructive",
          });
        });
    }
  }, [categoryId]);

  // ✅ Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Submitting category form...");

    try {
      const jwt = document.cookie
        .split("; ")
        .find((row) => row.startsWith("jwt="))
        ?.split("=")[1];

      console.log("Extracted JWT:", jwt ? "✅ Found token" : "❌ No token");

      const method = categoryId ? "patch" : "post";
      const url = categoryId ? `${BASE_URL}/${categoryId}` : BASE_URL;

      const res = await axios({
        method,
        url,
        data: { name, description },
        headers: { Authorization: `Bearer ${jwt}` },
        withCredentials: true,
      });

      console.log("Category response:", res.data);

      if (res.status === 200 || res.status === 201) {
        toast({
          title: "✅ Success",
          description: categoryId
            ? "Category updated successfully!"
            : "Category created successfully!",
          variant: "success",
        });
        setName("");
        setDescription("");
      } else {
        toast({
          title: "❌ Error",
          description: res.data?.message || "Unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Category form error:", err);
      toast({
        title: "⚠️ Network or Auth Error",
        description:
          err.response?.data?.message || "Something went wrong. Check console.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md shadow-md">
      <CardHeader>
        <CardTitle>
          {categoryId ? "Edit Category" : "Add Category"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Antibiotic"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description..."
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? "Saving..."
              : categoryId
              ? "Update Category"
              : "Create Category"}
          </Button>
        </form>

        {/* ✅ Toast Container */}
        <Toaster />
      </CardContent>
    </Card>
  );
}
