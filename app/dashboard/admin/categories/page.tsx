"use client";

import { useEffect, useState } from "react";
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

export default function CategoriesPage() {
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [jwt, setJwt] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  // Fetch categories
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jwt) return;

    setLoading(true);
    try {
      const url = editId ? `${BASE_URL}/${editId}` : BASE_URL;
      const method = editId ? "patch" : "post";

      await axios({ method, url, data: { name, description }, headers: { Authorization: `Bearer ${jwt}` } });

      toast({ title: "✅ Success", description: editId ? "Category updated!" : "Category created!", variant: "success" });

      setName("");
      setDescription("");
      setEditId(null);
      fetchCategories();
    } catch (err) {
      toast({ title: "❌ Error", description: "Failed to save category", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditId(cat._id);
    setName(cat.name);
    setDescription(cat.description || "");
  };

  const handleDelete = async (id: string) => {
    if (!jwt || !confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(`${BASE_URL}/${id}`, { headers: { Authorization: `Bearer ${jwt}` } });
      toast({ title: "✅ Deleted", description: "Category deleted", variant: "success" });
      fetchCategories();
    } catch (err) {
      toast({ title: "❌ Error", description: "Failed to delete category", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Toaster />

      <h1 className="text-2xl font-semibold text-blue-700">Categories</h1>

      {/* Category form */}
      <Card className="max-w-md shadow-md">
        <CardHeader>
          <CardTitle>{editId ? "Edit Category" : "Add Category"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category Name" required />
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description..." />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : editId ? "Update" : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Category list */}
      <Card className="max-w-md shadow-md">
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p>No categories found.</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat._id} className="flex justify-between items-center border p-2 rounded">
                  <span>{cat.name}</span>
                  <div className="space-x-2">
                    <Button size="sm" onClick={() => handleEdit(cat)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(cat._id)}>Delete</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
