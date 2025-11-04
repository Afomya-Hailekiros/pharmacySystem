"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, AlertTriangle, Clock, XCircle, Pill } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ComposedChart,
} from "recharts";

const MEDICINE_URL =
  "https://pharmacy-management-9ls6.onrender.com/api/v1/medicines";

interface Medicine {
  _id: string;
  brandName: string;
  quantity: number;
  packSize: string;
  stockAlert: number;
  expiryDate: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [jwt, setJwt] = useState<string | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  useEffect(() => {
    const getCookie = (name: string) => {
      const cookies = document.cookie ? document.cookie.split("; ") : [];
      for (const cookie of cookies) {
        const [key, ...rest] = cookie.split("=");
        if (key === name) return decodeURIComponent(rest.join("="));
      }
      return undefined;
    };
    setJwt(getCookie("jwt") || null);
  }, []);

  const fetchMedicines = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(MEDICINE_URL, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setMedicines(res.data.data || []);
    } catch {
      toast({
        title: "⚠️ Error Fetching Data",
        description: "Could not load medicine reports.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (jwt) fetchMedicines();
  }, [jwt]);

  const totalQty = (m: Medicine) =>
    (Number(m.quantity) || 0) * (Number(m.packSize) || 1);

  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);

  const lowStock = medicines.filter((m) => totalQty(m) < (m.stockAlert ?? 50));
  const expired = medicines.filter((m) => new Date(m.expiryDate) < now);
  const soonToExpire = medicines.filter((m) => {
    const exp = new Date(m.expiryDate);
    return exp > now && exp <= nextMonth;
  });

  const reportData = [
    { name: "Low Stock", value: lowStock.length },
    { name: "Expired", value: expired.length },
    { name: "To Be Expired", value: soonToExpire.length },
    { name: "Total", value: medicines.length },
  ];

  return (
    <div className="p-6 space-y-6">
      <Toaster />
      <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
        <BarChart className="h-6 w-6" /> Inventory Reports
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-red-300">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-red-600">
            {lowStock.length}
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-300">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-yellow-600 flex items-center gap-2">
              <Clock className="h-5 w-5" /> To Be Expired
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-yellow-600">
            {soonToExpire.length}
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-300">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-orange-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" /> Expired
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-orange-600">
            {expired.length}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-300">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-blue-600 flex items-center gap-2">
              <Pill className="h-5 w-5" /> Total Medicines
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-blue-600">
            {medicines.length}
          </CardContent>
        </Card>
      </div>

      <Card className="p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Inventory Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" barSize={50} fill="#2563eb" radius={8} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
