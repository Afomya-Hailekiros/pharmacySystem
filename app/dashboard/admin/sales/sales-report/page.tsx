"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const SALES_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/sales";

export default function SalesReportPage() {
  const { toast } = useToast();
  const [jwt, setJwt] = useState<string | null>(null);
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    const getCookie = (name: string) => {
      const cookies = document.cookie.split("; ");
      for (const c of cookies) {
        const [key, ...v] = c.split("=");
        if (key === name) return decodeURIComponent(v.join("="));
      }
      return undefined;
    };
    setJwt(getCookie("jwt") || null);
  }, []);

  const fetchSales = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(SALES_URL, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setSales(res.data.data.sales || []);
    } catch {
      toast({ title: "Error", description: "Failed to fetch report data.", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (jwt) fetchSales();
  }, [jwt]);

  const calculateReport = (period: "day" | "week" | "month") => {
    const now = new Date();
    return sales.filter((sale) => {
      const date = new Date(sale.saleDate);
      if (period === "day") return date.toDateString() === now.toDateString();
      if (period === "week") {
        const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }
      if (period === "month") return date.getMonth() === now.getMonth();
    });
  };

  const summarize = (filtered: any[]) => {
    let totalRevenue = 0;
    let totalProfit = 0;
    let cash = 0;
    let mobile = 0;
    const medicines: Record<string, number> = {};

    filtered.forEach((s) => {
      const sell = s.sellingPrice || s.medicineInfo.retailPrice || 0;
      const cost = s.medicineInfo.unitPrice || 0;
      const discount = s.discount || 0;
      const profit = Math.max(sell - cost - discount, 0) * s.quantity;
      const revenue = Math.max(sell - discount, 0) * s.quantity;

      totalProfit += profit;
      totalRevenue += revenue;

      if (s.paymentMethod?.toLowerCase() === "mobile") mobile += revenue;
      else cash += revenue;

      medicines[s.medicineInfo.brandName] =
        (medicines[s.medicineInfo.brandName] || 0) + s.quantity;
    });

    return { totalRevenue, totalProfit, cash, mobile, medicines };
  };

  const renderSection = (label: string, data: any) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      <Card>
        <CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader>
        <CardContent>${data.totalRevenue.toFixed(2)}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Total Profit</CardTitle></CardHeader>
        <CardContent>${data.totalProfit.toFixed(2)}</CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Payment Breakdown</CardTitle></CardHeader>
        <CardContent>
          <p>Cash: ${data.cash.toFixed(2)}</p>
          <p>Transfer: ${data.mobile.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card className="col-span-full">
        <CardHeader><CardTitle>Sold Medicines</CardTitle></CardHeader>
        <CardContent>
          {Object.keys(data.medicines).length === 0 ? (
            <p>No medicines sold in this period.</p>
          ) : (
            <ul className="space-y-1">
              {Object.entries(data.medicines).map(([name, qty]) => (
                <li key={name} className="flex justify-between">
                  <span>{name}</span> <span>{String(qty)} pcs</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const daily = summarize(calculateReport("day"));
  const weekly = summarize(calculateReport("week"));
  const monthly = summarize(calculateReport("month"));

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <Toaster />
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Sales Report</h1>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="flex justify-center mb-6">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">{renderSection("Daily", daily)}</TabsContent>
        <TabsContent value="weekly">{renderSection("Weekly", weekly)}</TabsContent>
        <TabsContent value="monthly">{renderSection("Monthly", monthly)}</TabsContent>
      </Tabs>
    </div>
  );
}
