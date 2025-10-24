"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function GenericList() {
  const [generics, setGenerics] = useState<any[]>([]);
  const { toast } = useToast();
  const BASE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/generics";

  const fetchGenerics = async () => {
    try {
      const jwt = document.cookie
        .split("; ")
        .find((row) => row.startsWith("jwt="))
        ?.split("=")[1];

      if (!jwt) {
        toast({
          title: "⚠️ Unauthorized",
          description: "Please log in to view generics.",
          variant: "destructive",
        });
        return;
      }

      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${jwt}` },
        withCredentials: true,
      });

      if (res.status === 200 && res.data?.data?.generics) {
        setGenerics(res.data.data.generics);
      } else {
        toast({
          title: "ℹ️ No Generics Found",
          description: "No generic medicines found in the database.",
        });
      }
    } catch (err: any) {
      toast({
        title: "❌ Error",
        description:
          err.response?.data?.message ||
          "Failed to fetch generics. Check your connection or token.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this generic?")) return;

    try {
      const jwt = document.cookie
        .split("; ")
        .find((row) => row.startsWith("jwt="))
        ?.split("=")[1];

      const res = await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
        withCredentials: true,
      });

      if (res.status === 204 || res.status === 200) {
        toast({
          title: "✅ Deleted",
          description: "Generic deleted successfully.",
        });
        fetchGenerics();
      } else {
        toast({
          title: "❌ Failed",
          description: res.data?.message || "Could not delete generic.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "⚠️ Error",
        description:
          err.response?.data?.message || "Something went wrong while deleting.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchGenerics();
  }, []);

  return (
    <Card className="bg-gray-900 text-white">
      <CardHeader>
        <CardTitle className="text-white">All Generics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {generics.length === 0 ? (
            <p className="text-gray-300">No generics found.</p>
          ) : (
            generics.map((gen) => (
              <div
                key={gen._id}
                className="flex justify-between items-center p-3 border rounded-lg bg-black hover:bg-gray-800 transition-colors"
              >
                <div>
                  <p className="font-medium text-black">{gen.name}</p>
                  <p className="text-sm text-black">{gen.description}</p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white hover:bg-white hover:text-gray-900"
                    onClick={() =>
                      (window.location.href = `/dashboard/admin/generics?edit=${gen._id}`)
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(gen._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <Toaster />
      </CardContent>
    </Card>
  );
}
