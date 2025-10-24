"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface Generic {
  _id: string;
  name: string;
  description: string;
}

export default function GenericsPage() {
  const { toast } = useToast();

  const [generics, setGenerics] = useState<Generic[]>([]);
  const [jwt, setJwt] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/generics";

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
    setJwt(getCookie("jwt") || null);
  }, []);

  const fetchGenerics = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(BASE_URL, { headers: { Authorization: `Bearer ${jwt}` } });
      setGenerics(res.data.data.generics || []);
    } catch {
      toast({ title: "❌ Error", description: "Failed to fetch generics", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchGenerics();
  }, [jwt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jwt) return;

    setLoading(true);
    try {
      const url = editId ? `${BASE_URL}/${editId}` : BASE_URL;
      const method = editId ? "patch" : "post";

      await axios({ method, url, data: { name, description }, headers: { Authorization: `Bearer ${jwt}` } });

      toast({ title: "✅ Success", description: editId ? "Generic updated!" : "Generic created!", variant: "success" });
      setName("");
      setDescription("");
      setEditId(null);
      fetchGenerics();
    } catch {
      toast({ title: "❌ Error", description: "Failed to save generic", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (gen: Generic) => {
    setEditId(gen._id);
    setName(gen.name);
    setDescription(gen.description || "");
  };

  const handleDelete = async (id: string) => {
    if (!jwt || !confirm("Are you sure you want to delete this generic?")) return;
    try {
      await axios.delete(`${BASE_URL}/${id}`, { headers: { Authorization: `Bearer ${jwt}` } });
      toast({ title: "✅ Deleted", description: "Generic deleted", variant: "success" });
      fetchGenerics();
    } catch {
      toast({ title: "❌ Error", description: "Failed to delete generic", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Toaster />
      <h1 className="text-2xl font-semibold text-blue-700">Generics</h1>

      {/* Generic Form */}
      <Card className="max-w-2xl shadow-md bg-gray-800 text-white">
        <CardHeader>
          <CardTitle>{editId ? "Edit Generic" : "Add Generic"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Generic Name"
              required
              className="bg-gray-700 text-white border-gray-600 placeholder-gray-400"
            />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description..."
              className="bg-gray-700 text-white border-gray-600 placeholder-gray-400"
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : editId ? "Update" : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Generic List */}
      <Card className="max-w-2xl shadow-md bg-gray-900 text-white">
        <CardHeader>
          <CardTitle>All Generics</CardTitle>
        </CardHeader>
        <CardContent>
          {generics.length === 0 ? (
            <p className="text-gray-300">No generics found.</p>
          ) : (
            <ul className="space-y-2">
              {generics.map((gen) => (
                <li
                  key={gen._id}
                  className="flex justify-between items-center p-3 border rounded-lg bg-gray-800 hover:bg-blue-700 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">{gen.name}</p>
                    <p className="text-sm text-gray-300">{gen.description}</p>
                  </div>
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-white border-white hover:bg-white hover:text-gray-900"
                      onClick={() => handleEdit(gen)}
                    >
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(gen._id)}>
                      Delete
                    </Button>
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
