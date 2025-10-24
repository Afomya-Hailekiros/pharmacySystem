"use client";

import { useState } from "react";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function DosageForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const BASE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/dosages";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const jwt = document.cookie
        .split("; ")
        .find((row) => row.startsWith("jwt="))
        ?.split("=")[1];

      if (!jwt) {
        toast({
          title: "⚠️ Unauthorized",
          description: "Please login first.",
          variant: "destructive",
        });
        return;
      }

      const res = await axios.post(
        BASE_URL,
        { name, description },
        {
          headers: { Authorization: `Bearer ${jwt}` },
          withCredentials: true,
        }
      );

      if (res.status === 201) {
        toast({
          title: "✅ Success",
          description: "Dosage added successfully!",
        });
        setName("");
        setDescription("");
      }
    } catch (err: any) {
      console.error("Error adding dosage:", err);
      toast({
        title: "❌ Failed",
        description:
          err.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-700">Add Dosage</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Dosage Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Add Dosage
          </Button>
        </form>
        <Toaster />
      </CardContent>
    </Card>
  );
}
