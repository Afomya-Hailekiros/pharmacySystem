"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function DosageList() {
  const [dosages, setDosages] = useState<any[]>([]);
  const { toast } = useToast();
  const BASE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/dosages";

  const fetchDosages = async () => {
    try {
      const jwt = document.cookie
        .split("; ")
        .find((row) => row.startsWith("jwt="))
        ?.split("=")[1];

      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${jwt}` },
        withCredentials: true,
      });

      if (res.status === 200 && res.data?.data?.dosages) {
        setDosages(res.data.data.dosages);
      } else {
        toast({
          title: "❌ Failed",
          description: res.data?.message || "Failed to load dosages",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error fetching dosages:", err);
      toast({
        title: "⚠️ Error",
        description:
          err.response?.data?.message || "Network or auth issue occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dosage?")) return;

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
          description: "Dosage deleted successfully.",
        });
        fetchDosages();
      } else {
        toast({
          title: "❌ Failed",
          description: res.data?.message || "Could not delete dosage.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "⚠️ Error",
        description:
          err.response?.data?.message ||
          "Something went wrong while deleting.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDosages();
  }, []);

  return (
    <Card className="bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-700">All Dosages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dosages.length === 0 ? (
            <p className="text-gray-500">No dosages found.</p>
          ) : (
            dosages.map((d) => (
              <div
                key={d._id}
                className="flex justify-between items-center p-3 border rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
              >
                <div>
                  <p className="font-medium text-blue-900">{d.name}</p>
                  <p className="text-sm text-blue-800">{d.description}</p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      (window.location.href = `/dashboard/admin/dosages?edit=${d._id}`)
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(d._id)}
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
