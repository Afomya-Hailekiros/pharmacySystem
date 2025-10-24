"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export const UOMForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [jwt, setJwt] = useState<string | null>(null);

  const UOM_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/UOM";

  useEffect(() => {
    const getCookie = (name: string) => {
      const matches = document.cookie.match(
        new RegExp(
          "(?:^|; )" +
            name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
            "=([^;]*)"
        )
      );
      return matches ? decodeURIComponent(matches[1]) : undefined;
    };
    setJwt(getCookie("jwt") || null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jwt || !name.trim()) return;

    try {
      await axios.post(
        UOM_URL,
        { name },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );

      toast({
        title: "✅ Success",
        description: "UOM added successfully",
      });
      setName("");
      onSuccess();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to add UOM",
        variant: "destructive",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow space-y-4 border"
    >
      <Input
        placeholder="Enter UOM name (e.g., Tablet, ml, Bottle)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border-gray-300"
      />
      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
        Add UOM
      </Button>
    </form>
  );
};
