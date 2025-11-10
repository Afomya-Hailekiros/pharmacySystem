"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

/* ---------------------- TYPES ---------------------- */
type SaleReportItem = {
  medicine: string | undefined;
  _id: string;
  medicineInfo?: { _id?: string; brandName?: string };
  quantity?: number;
  totalRevenuePrice?: number;
  profit?: number;
  saleDate?: string;
  formattedDate?: string;
};

type ProfitReportItem = { date?: string; profit?: number; totalRevenue?: number };

type MedicineReportItem = {
  _id: string;
  brandName?: string;
  quantity?: number;
  retailPrice?: number;
  totalRetailPrice?: number;
  uomInfo?: { name?: string } | null;
  stockAlert?: number;
  isExpired?: boolean;
  isNearExpired?: boolean;
};

/* ---------------------- CONFIG ---------------------- */
const SALES_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/reports/sales";
const PROFIT_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/reports/profit";
const MEDICINES_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/reports/medicines";

const PIE_COLORS = ["#3b82f6", "#06b6d4", "#f97316", "#ef4444", "#10b981"];

/* ---------------------- UTILS ---------------------- */
const getCookie = (name: string) => {
  const c = document.cookie.split("; ").find((c) => c.startsWith(name + "="));
  return c ? decodeURIComponent(c.split("=")[1]) : undefined;
};

const formatCurrency = (n: number) => `$${(n ?? 0).toFixed(2)}`;

/* ---------------------- NORMALIZERS ---------------------- */
const normalizeSalesResponse = (res: any): SaleReportItem[] => {
  const body = res?.data ?? res;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.data?.sales)) return body.data.sales;
  if (Array.isArray(body.data?.data)) return body.data.data;
  return [];
};

const normalizeProfitResponse = (res: any): ProfitReportItem[] => {
  const body = res?.data ?? res;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.data?.profit)) return body.data.profit;
  return [];
};

const normalizeMedicinesResponse = (res: any): MedicineReportItem[] => {
  const body = res?.data ?? res;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.data?.all)) return body.data.all;
  if (Array.isArray(body.data?.data)) return body.data.data;
  return [];
};

/* ---------------------- AGGREGATIONS ---------------------- */
const aggregateByDay = (sales: SaleReportItem[]) => {
  const map = new Map<string, { date: string; revenue: number; profit: number }>();
  sales.forEach((s) => {
    const d = s.saleDate ? s.saleDate.slice(0, 10) : "unknown";
    const revenue = s.totalRevenuePrice ?? 0;
    const profit = s.profit ?? 0;
    const existing = map.get(d);
    if (!existing) map.set(d, { date: d, revenue, profit });
    else map.set(d, { date: d, revenue: existing.revenue + revenue, profit: existing.profit + profit });
  });
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
};

const getLastNDays = (aggDaily: { date: string; revenue: number; profit: number }[], days = 7) => {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const dt = new Date();
    dt.setDate(now.getDate() - (days - 1 - i));
    const key = dt.toISOString().slice(0, 10);
    const found = aggDaily.find((x) => x.date === key);
    return { dateLabel: dt.toLocaleDateString(), date: key, revenue: found?.revenue ?? 0, profit: found?.profit ?? 0 };
  });
};

const aggregateWeekly = (sales: SaleReportItem[], weeks = 4) => {
  const map = new Map<string, { week: string; revenue: number; profit: number }>();
  const getYearWeek = (d: Date) => {
    const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((+tmp - +yearStart) / 86400000 + 1) / 7);
    return `${tmp.getUTCFullYear()}-W${weekNo}`;
  };
  sales.forEach((s) => {
    const d = s.saleDate ? new Date(s.saleDate) : new Date();
    const week = getYearWeek(d);
    const revenue = s.totalRevenuePrice ?? 0;
    const profit = s.profit ?? 0;
    const ex = map.get(week);
    if (!ex) map.set(week, { week, revenue, profit });
    else map.set(week, { week, revenue: ex.revenue + revenue, profit: ex.profit + profit });
  });
  return Array.from(map.values()).sort((a, b) => a.week.localeCompare(b.week)).slice(-weeks);
};

const topMedicinesByVolume = (sales: SaleReportItem[], topN = 5) => {
  const map = new Map<string, { brandName: string; quantity: number }>();
  sales.forEach((s) => {
    const id = s.medicineInfo?._id ?? "unknown";
    const name = s.medicineInfo?.brandName ?? "Unknown";
    const existing = map.get(id);
    const qty = s.quantity ?? 0;
    if (!existing) map.set(id, { brandName: name, quantity: qty });
    else existing.quantity += qty;
  });
  return Array.from(map.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, topN)
    .map((x, i) => ({ name: x.brandName, value: x.quantity, color: PIE_COLORS[i % PIE_COLORS.length] }));
};

/* ---------------------- COMPONENT ---------------------- */
export default function ReportsPage() {
  const { toast } = useToast();
  const [jwt, setJwt] = useState<string | null>(null);
  const [sales, setSales] = useState<SaleReportItem[]>([]);
  const [profitSeries, setProfitSeries] = useState<ProfitReportItem[]>([]);
  const [medicines, setMedicines] = useState<MedicineReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => setJwt(getCookie("jwt") || null), []);

  useEffect(() => {
    if (!jwt) return setLoading(false);

    let cancelled = false;

    const fetchReports = async () => {
      try {
        setLoading(true);
        const [salesRes, profitRes, medsRes] = await Promise.all([
          axios.get(SALES_URL, { headers: { Authorization: `Bearer ${jwt}` } }),
          axios.get(PROFIT_URL, { headers: { Authorization: `Bearer ${jwt}` } }),
          axios.get(MEDICINES_URL, { headers: { Authorization: `Bearer ${jwt}` } }),
        ]);
        if (cancelled) return;
        setSales(normalizeSalesResponse(salesRes));
        setProfitSeries(normalizeProfitResponse(profitRes));
        setMedicines(normalizeMedicinesResponse(medsRes));
      } catch (err: any) {
        console.error(err);
        toast({ title: "Error", description: err?.response?.data?.message || "Failed to fetch reports", variant: "destructive" });
        setErrorMsg(err?.response?.data?.message || "Failed to fetch reports");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReports();
    return () => { cancelled = true; };
  }, [jwt, toast]);

  /* ---------------------- AGGREGATIONS ---------------------- */
  const aggDaily = useMemo(() => aggregateByDay(sales), [sales]);
  const last7Days = useMemo(() => getLastNDays(aggDaily, 7), [aggDaily]);
  const weekly = useMemo(() => aggregateWeekly(sales, 4), [sales]);
  const topMeds = useMemo(() => topMedicinesByVolume(sales, 5), [sales]);

  const todayKey = new Date().toISOString().slice(0, 10);

  const todaySales = sales
    .filter((s) => s.saleDate?.slice(0, 10) === todayKey)
    .reduce((sum, s) => sum + (s.totalRevenuePrice ?? 0), 0);

  const todayProfit = sales
    .filter((s) => s.saleDate?.slice(0, 10) === todayKey)
    .reduce((sum, s) => sum + (s.profit ?? 0), 0);

  const weeklySalesTotal = last7Days.reduce((s, x) => s + x.revenue, 0);
  const weeklyProfitTotal = last7Days.reduce((s, x) => s + x.profit, 0);

  /* ---------------------- RENDER ---------------------- */
  if (loading) return <div className="p-6"><Toaster />Loading...</div>;
  if (errorMsg) return <div className="p-6"><Toaster />Error: {errorMsg}</div>;

  return (
    <div className="p-6">
      <Toaster />
      <motion.header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Package className="h-7 w-7" />
          <div>
            <h1 className="text-2xl font-bold">📊 Pharmacy Reports Dashboard</h1>
            <p className="text-sm text-muted-foreground">Daily & weekly sales, profit, and medicine performance.</p>
          </div>
        </div>
        <Button variant="ghost" onClick={() => setJwt(getCookie("jwt") || null)}>Refresh</Button>
      </motion.header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle>Today's Sales</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(todaySales)}</div>
            <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Today's Profit</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(todayProfit)}</div>
            <div className="text-sm text-muted-foreground">Profit today</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Last 7 Days</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(weeklySalesTotal)}</div>
            <div className="text-sm text-muted-foreground">
              Profit: {formatCurrency(weeklyProfitTotal)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Daily Sales (Last 7 days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ReBarChart data={last7Days}>
                <XAxis dataKey="dateLabel" />
                <YAxis />
                <ReTooltip formatter={(v: any) => formatCurrency(Number(v) || 0)} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" />
                <Bar dataKey="profit" name="Profit" />
              </ReBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Medicines by Volume</CardTitle></CardHeader>
          <CardContent>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={topMeds} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {topMeds.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2">
              {topMeds.map((m) => (
                <div key={m.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3" style={{ background: m.color }} />
                    <span className="font-medium">{m.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{m.value} units</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medicines Table */}
      <Card className="mt-6">
        <CardHeader><CardTitle>Medicines Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Brand</th><th>Stock</th><th>Retail</th><th>TotalRetail</th><th>UOM</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((m) => (
                  <tr key={m._id} className="border-t">
                    <td>{m.brandName}</td>
                    <td>{m.quantity ?? 0}</td>
                    <td>{formatCurrency(m.retailPrice ?? 0)}</td>
                    <td>{formatCurrency(m.totalRetailPrice ?? 0)}</td>
                    <td>{m.uomInfo?.name ?? "-"}</td>
                    <td>{m.isExpired ? "Expired" : m.isNearExpired ? "Near expiry" : (m.stockAlert && (m.quantity ?? 0) <= m.stockAlert ? "Low stock" : "OK")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card className="mt-6">
        <CardHeader><CardTitle>Sales Details</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Quantity</th>
                  <th>Revenue</th>
                  <th>Profit</th>
                  <th>Date</th>
                  <th>Weekly Revenue</th>
                  <th>Weekly Profit</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted-foreground">No sales available</td>
                  </tr>
                ) : (
                  sales.map((s) => {
                    const saleDateKey = s.saleDate?.slice(0, 10);
                    const isToday = saleDateKey === todayKey;

                    const medId = s.medicineInfo?._id ?? s.medicine ?? "unknown";
                    const weeklyMedSales = sales.filter(
                      (x) => (x.medicineInfo?._id ?? x.medicine ?? "unknown") === medId &&
                             new Date(x.saleDate ?? "").getTime() >=
                             new Date(new Date().setDate(new Date().getDate() - 6)).getTime()
                    );
                    const weeklyRevenue = weeklyMedSales.reduce((sum, x) => sum + (x.totalRevenuePrice ?? 0), 0);
                    const weeklyProfit = weeklyMedSales.reduce((sum, x) => sum + (x.profit ?? 0), 0);

                    return (
                      <tr key={s._id} className={`border-t ${isToday ? "bg-green-100 font-medium" : ""}`}>
                        <td>{s.medicineInfo?.brandName ?? "Unknown"}</td>
                        <td>{s.quantity ?? 0}</td>
                        <td>{formatCurrency(s.totalRevenuePrice ?? 0)}</td>
                        <td>{formatCurrency(s.profit ?? 0)}</td>
                        <td>{s.formattedDate ?? (s.saleDate ? new Date(s.saleDate).toLocaleDateString() : "-")}</td>
                        <td>{formatCurrency(weeklyRevenue)}</td>
                        <td>{formatCurrency(weeklyProfit)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot className="border-t font-semibold">
                <tr>
                  <td>Total (Today)</td>
                  <td>-</td>
                  <td>{formatCurrency(todaySales)}</td>
                  <td>{formatCurrency(todayProfit)}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Total (Last 7 days)</td>
                  <td>-</td>
                  <td>{formatCurrency(weeklySalesTotal)}</td>
                  <td>{formatCurrency(weeklyProfitTotal)}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
