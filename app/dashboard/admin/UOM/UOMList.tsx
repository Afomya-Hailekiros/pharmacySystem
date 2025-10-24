"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function UOMList() {
  const [uoms, setUoms] = useState<any[]>([]);
  const { toast } = useToast();
  const BASE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/UOM";

  const fetchUOMs = async () => {
    try {
      const jwt = document.cookie
        .split("; ")
        .find((row) => row.startsWith("jwt="))
        ?.split("=")[1];

      console.log("Fetching UOMs... JWT:", jwt ? "✅ Found" : "❌ Missing");

      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${jwt}` },
        withCredentials: true,
      });

      console.log("Fetched UOMs:", res.data);

      if (res.status === 200 && res.data?.data?.units) {
        setUoms(res.data.data.units);
      } else {
        toast({
          title: "❌ Failed",
          description: res.data?.message || "Failed to load UOMs",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error fetching UOMs:", err);
      toast({
        title: "⚠️ Error",
        description:
          err.response?.data?.message || "Network or auth issue occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this UOM?")) return;

    try {
      const jwt = document.cookie
        .split("; ")
        .find((row) => row.startsWith("jwt="))
        ?.split("=")[1];

      console.log("Deleting UOM:", id, "| JWT:", jwt ? "✅ Found" : "❌ Missing");

      const res = await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
        withCredentials: true,
      });

      console.log("Delete response:", res.data);

      if (res.status === 204 || res.status === 200) {
        toast({
          title: "✅ Deleted",
          description: "UOM deleted successfully.",
          variant: "success",
        });
        fetchUOMs();
      } else {
        toast({
          title: "❌ Failed",
          description: res.data?.message || "Could not delete UOM.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Error deleting UOM:", err);
      toast({
        title: "⚠️ Network Error",
        description:
          err.response?.data?.message || "Something went wrong. Check console.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUOMs();
  }, []);

  return (
    <Card className="bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-700">All Units of Measurement (UOMs)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {uoms.length === 0 ? (
            <p className="text-gray-500">No UOMs found.</p>
          ) : (
            uoms.map((uom) => (
              <div
                key={uom._id}
                className="flex justify-between items-center p-3 border rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
              >
                <div>
                  <p className="font-medium text-blue-900">{uom.name}</p>
                  <p className="text-sm text-blue-800">{uom.description}</p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      (window.location.href = `/dashboard/admin/UOM?edit=${uom._id}`)
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(uom._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ✅ Toast container */}
        <Toaster />
      </CardContent>
    </Card>
  );
}
