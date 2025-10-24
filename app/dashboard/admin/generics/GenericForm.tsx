"use client";

import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function GenericForm({ genericId }: { genericId?: string }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const BASE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/generics";

  useEffect(() => {
    if (genericId) {
      axios
        .get(`${BASE_URL}/${genericId}`, { withCredentials: true })
        .then((res) => {
          const gen = res.data?.data?.generic;
          setName(gen?.name || "");
          setDescription(gen?.description || "");
        })
        .catch((err) => {
          toast({
            title: "⚠️ Failed to load generic",
            description: err.response?.data?.message || "Error loading generic",
            variant: "destructive",
          });
        });
    }
  }, [genericId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jwt = document.cookie
        .split("; ")
        .find((row) => row.startsWith("jwt="))
        ?.split("=")[1];

      const method = genericId ? "patch" : "post";
      const url = genericId ? `${BASE_URL}/${genericId}` : BASE_URL;

      const res = await axios({
        method,
        url,
        data: { name, description },
        headers: { Authorization: `Bearer ${jwt}` },
        withCredentials: true,
      });

      if (res.status === 200 || res.status === 201) {
        toast({
          title: "✅ Success",
          description: genericId
            ? "Generic updated successfully!"
            : "Generic created successfully!",
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
      toast({
        title: "⚠️ Error",
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
        <CardTitle>{genericId ? "Edit Generic" : "Add Generic"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Generic Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Amoxicillin"
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
              : genericId
              ? "Update Generic"
              : "Create Generic"}
          </Button>
        </form>
        <Toaster />
      </CardContent>
    </Card>
  );
}
