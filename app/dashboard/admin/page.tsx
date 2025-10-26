"use client";

import { useEffect, useState } from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Users, Pill, BarChart3, List, Boxes, Syringe, Package, FlaskConical } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface Category { _id: string; name: string; }
interface Generic { _id: string; name: string; }
interface Dosage { _id: string; name: string; }
interface UOM { _id: string; name: string; }
interface User { _id: string; name: string; email: string; }
interface Medicine { _id: string; name: string; }

export default function AdminDashboard() {
  const { toast } = useToast();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [generics, setGenerics] = useState<Generic[]>([]);
  const [dosages, setDosages] = useState<Dosage[]>([]);
  const [units, setUoms] = useState<UOM[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [jwt, setJwt] = useState<string | null>(null);

  // ✅ API URLs
  const CATEGORY_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/categories";
  const GENERIC_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/generics";
  const DOSAGE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/dosages";
  const UOM_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/UOMs";
  const USERS_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/users";
  const MEDICINES_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/medicines";

  // ✅ Load JWT from cookies
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

  // ✅ Fetch categories
  const fetchCategories = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(CATEGORY_URL, { headers: { Authorization: `Bearer ${jwt}` } });
      setCategories(res.data.data.categories || []);
    } catch {
      toast({ title: "❌ Error", description: "Failed to fetch categories", variant: "destructive" });
    }
  };

  // ✅ Fetch generics
  const fetchGenerics = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(GENERIC_URL, { headers: { Authorization: `Bearer ${jwt}` } });
      setGenerics(res.data.data.generics || []);
    } catch {
      toast({ title: "⚠️ Error", description: "Failed to fetch generics", variant: "destructive" });
    }
  };

  // ✅ Fetch dosages
  const fetchDosages = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(DOSAGE_URL, { headers: { Authorization: `Bearer ${jwt}` } });
      setDosages(res.data.data.dosages || []);
    } catch {
      toast({ title: "⚠️ Error", description: "Failed to fetch dosages", variant: "destructive" });
    }
  };

  // ✅ Fetch UOMs
  const fetchUOMs = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(UOM_URL, { headers: { Authorization: `Bearer ${jwt}` } });
      setUoms(res.data.data.units || []);
    } catch {
      toast({ title: "⚠️ Error", description: "Failed to fetch UOMs", variant: "destructive" });
    }
  };

  // ✅ Fetch Users
  const fetchUsers = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(USERS_URL, { headers: { Authorization: `Bearer ${jwt}` } });
      setUsers(res.data.data.users || []);
    } catch {
      toast({ title: "⚠️ Error", description: "Failed to fetch users", variant: "destructive" });
    }
  };

  // ✅ Fetch Medicines
  const fetchMedicines = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(MEDICINES_URL, { headers: { Authorization: `Bearer ${jwt}` } });
      setMedicines(res.data.data.medicines || []);
    } catch {
      toast({ title: "⚠️ Error", description: "Failed to fetch medicines", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (jwt) {
      fetchCategories();
      fetchGenerics();
      fetchDosages();
      fetchUOMs();
      fetchUsers();
      fetchMedicines(); // ✅ Fetch medicines
    }
  }, [jwt]);

  return (
    <div className="space-y-6 p-6">
      <Toaster />
      <h1 className="text-2xl font-semibold text-blue-700">Admin Dashboard</h1>

      {/* ✅ Dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Users */}
        <div onClick={() => router.push("/dashboard/admin/users")} className="cursor-pointer hover:shadow-lg transition">
          <DashboardCard title="Users" value={users.length.toString()} icon={Users} />
        </div>

        {/* Medicines */}
        {/* Medicines */}
       <div onClick={() => router.push("/dashboard/admin/medicines")} className="cursor-pointer hover:shadow-lg transition">
         <DashboardCard title="Medicines" value={medicines.length.toString()} icon={FlaskConical} />
       </div>


        {/* Categories */}
        <div onClick={() => router.push("/dashboard/admin/categories")} className="cursor-pointer hover:shadow-lg transition">
          <DashboardCard title="Categories" value={categories.length.toString()} icon={List} />
        </div>

        {/* Generics */}
        <div onClick={() => router.push("/dashboard/admin/generics")} className="cursor-pointer hover:shadow-lg transition">
          <DashboardCard title="Generics" value={generics.length.toString()} icon={Boxes} />
        </div>

        {/* Dosages */}
        <div onClick={() => router.push("/dashboard/admin/dosages")} className="cursor-pointer hover:shadow-lg transition">
          <DashboardCard title="Dosages" value={dosages.length.toString()} icon={Syringe} />
        </div>

        {/* UOMs */}
        <div onClick={() => router.push("/dashboard/admin/UOM")} className="cursor-pointer hover:shadow-lg transition">
          <DashboardCard title="UOMs" value={units.length.toString()} icon={Package} />
        </div>
      </div>
    </div>
  );
}
