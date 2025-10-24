"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

// Types
interface UOM {
  _id: string;
  name: string;
  description: string;
}

export default function UOMPage() {
  const { toast } = useToast();

  const [uoms, setUoms] = useState<UOM[]>([]);
  const [jwt, setJwt] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/UOM";

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

  // ✅ Fetch UOMs
  const fetchUoms = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setUoms(res.data.data.units || []);
    } catch (err) {
      toast({
        title: "❌ Error",
        description: "Failed to fetch UOMs",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUoms();
  }, [jwt]);

  // ✅ Create or update UOM
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
        description: editId ? "UOM updated!" : "UOM created!",
        variant: "success",
      });

      setName("");
      setDescription("");
      setEditId(null);
      fetchUoms();
    } catch (err) {
      toast({
        title: "❌ Error",
        description: "Failed to save UOM",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit UOM
  const handleEdit = (uom: UOM) => {
    setEditId(uom._id);
    setName(uom.name);
    setDescription(uom.description || "");
  };

  // ✅ Delete UOM
  const handleDelete = async (id: string) => {
    if (!jwt || !confirm("Are you sure you want to delete this UOM?")) return;
    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      toast({
        title: "✅ Deleted",
        description: "UOM deleted successfully",
        variant: "success",
      });
      fetchUoms();
    } catch (err) {
      toast({
        title: "❌ Error",
        description: "Failed to delete UOM",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Toaster />
      <h1 className="text-2xl font-semibold text-blue-700">Units of Measurement</h1>

      {/* ✅ UOM Form */}
      <Card className="max-w-md shadow-md">
        <CardHeader>
          <CardTitle>{editId ? "Edit UOM" : "Add UOM"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="UOM Name (e.g., Tablet, ml, Bottle)"
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

      {/* ✅ UOM List */}
      <Card className="max-w-md shadow-md">
        <CardHeader>
          <CardTitle>All UOMs</CardTitle>
        </CardHeader>
        <CardContent>
          {uoms.length === 0 ? (
            <p>No UOMs found.</p>
          ) : (
            <ul className="space-y-2">
              {uoms.map((uom) => (
                <li
                  key={uom._id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>{uom.name}</span>
                  <div className="space-x-2">
                    <Button size="sm" onClick={() => handleEdit(uom)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(uom._id)}
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
