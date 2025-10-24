"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

// Types
interface Dosage {
  _id: string;
  name: string;
  description: string;
}

export default function DosagesPage() {
  const { toast } = useToast();

  const [dosages, setDosages] = useState<Dosage[]>([]);
  const [jwt, setJwt] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/dosages";

  // ✅ Load JWT from cookies
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

  // ✅ Fetch dosages
  const fetchDosages = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setDosages(res.data.data.dosages || []);
    } catch (err) {
      toast({
        title: "❌ Error",
        description: "Failed to fetch dosages",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDosages();
  }, [jwt]);

  // ✅ Create or update dosage
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jwt) return;

    setLoading(true);
    try {
      const url = editId ? `${BASE_URL}/${editId}` : BASE_URL;
      const method = editId ? "patch" : "post";

      await axios({
        method,
        url,
        data: { name, description },
        headers: { Authorization: `Bearer ${jwt}` },
      });

      toast({
        title: "✅ Success",
        description: editId ? "Dosage updated!" : "Dosage created!",
        variant: "success",
      });

      setName("");
      setDescription("");
      setEditId(null);
      fetchDosages();
    } catch (err) {
      toast({
        title: "❌ Error",
        description: "Failed to save dosage",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit dosage
  const handleEdit = (dos: Dosage) => {
    setEditId(dos._id);
    setName(dos.name);
    setDescription(dos.description || "");
  };

  // ✅ Delete dosage
  const handleDelete = async (id: string) => {
    if (!jwt || !confirm("Are you sure you want to delete this dosage?")) return;
    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      toast({
        title: "✅ Deleted",
        description: "Dosage deleted",
        variant: "success",
      });
      fetchDosages();
    } catch (err) {
      toast({
        title: "❌ Error",
        description: "Failed to delete dosage",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Toaster />

      <h1 className="text-2xl font-semibold text-blue-700">Dosages</h1>

      {/* ✅ Dosage form */}
      <Card className="max-w-md shadow-md">
        <CardHeader>
          <CardTitle>{editId ? "Edit Dosage" : "Add Dosage"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dosage Name"
              required
            />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description..."
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : editId ? "Update" : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ✅ Dosage list */}
      <Card className="max-w-md shadow-md">
        <CardHeader>
          <CardTitle>All Dosages</CardTitle>
        </CardHeader>
        <CardContent>
          {dosages.length === 0 ? (
            <p>No dosages found.</p>
          ) : (
            <ul className="space-y-2">
              {dosages.map((dos) => (
                <li
                  key={dos._id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>{dos.name}</span>
                  <div className="space-x-2">
                    <Button size="sm" onClick={() => handleEdit(dos)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(dos._id)}
                    >
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
