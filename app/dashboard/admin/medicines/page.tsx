"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, AlertTriangle, Clock, XCircle, Pill, Package } from "lucide-react";

interface Medicine {
  _id?: string;
  brandName: string;
  categoryInfo?: { name: string; _id?: string };
  genericInfo?: { name: string; _id?: string };
  dosageInfo?: { dosageInfo: string; _id?: string };
  uomInfo?: { name: string; _id?: string };
  batchNo?: string;
  expiryDate?: string;
  quantity?: number;
  unitPrice?: number;
  stockAlert?: number;
  packSize?: string;
  itemStrength?: string;
  origin?: string;
}

interface Option {
  _id: string;
  name: string;
}

// URLs
const MEDICINE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/medicines";
const CATEGORY_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/categories";
const GENERIC_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/generics";
const DOSAGE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/dosages";
const UOM_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/UOMs";

export default function MedicinesPage() {
  const { toast } = useToast();
  const [jwt, setJwt] = useState<string | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filtered, setFiltered] = useState<Medicine[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const [categories, setCategories] = useState<Option[]>([]);
  const [generics, setGenerics] = useState<Option[]>([]);
  const [dosages, setDosages] = useState<Option[]>([]);
  const [units, setUnits] = useState<Option[]>([]);

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
      const res = await axios.get(MEDICINE_URL, { headers: { Authorization: `Bearer ${jwt}` } });
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setMedicines(data);
      applyFilter(data, filterType);
    } catch {
      toast({ title: "⚠️ Error Fetching Medicines", description: "Failed to fetch medicines.", variant: "destructive" });
    }
  };

  const fetchDropdowns = async () => {
    if (!jwt) return;
    try {
      const [cats, gens, dos, uo] = await Promise.all([
        axios.get(CATEGORY_URL, { headers: { Authorization: `Bearer ${jwt}` } }),
        axios.get(GENERIC_URL, { headers: { Authorization: `Bearer ${jwt}` } }),
        axios.get(DOSAGE_URL, { headers: { Authorization: `Bearer ${jwt}` } }),
        axios.get(UOM_URL, { headers: { Authorization: `Bearer ${jwt}` } }),
      ]);
      setCategories(cats.data.data.categories || []);
      setGenerics(gens.data.data.generics || []);
      setDosages(dos.data.data.dosages || []);
      setUnits(uo.data.data.units || []);
    } catch {
      toast({
        title: "❌ Error",
        description: "Failed to load dropdown data.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (jwt) {
      fetchMedicines();
      fetchDropdowns();
    }
  }, [jwt]);

  const applyFilter = (meds: Medicine[], type: string) => {
    const now = new Date();
    if (type === "low") setFiltered(meds.filter((m) => (m.quantity ?? 0) < (m.stockAlert ?? 50)));
    else if (type === "expired") setFiltered(meds.filter((m) => new Date(m.expiryDate || "") < now));
    else if (type === "soon") {
      const nextMonth = new Date();
      nextMonth.setMonth(now.getMonth() + 1);
      setFiltered(meds.filter((m) => {
        const exp = new Date(m.expiryDate || "");
        return exp > now && exp <= nextMonth;
      }));
    } else setFiltered(meds);
  };

  const handleFilter = (type: string) => {
    setFilterType(type);
    applyFilter(medicines, type);
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      applyFilter(medicines, filterType);
      return;
    }
    const lower = searchTerm.toLowerCase();
    setFiltered(medicines.filter(
      (m) =>
        m.brandName?.toLowerCase().includes(lower) ||
        m.genericInfo?.name?.toLowerCase().includes(lower) ||
        m.categoryInfo?.name?.toLowerCase().includes(lower)
    ));
  }, [searchTerm, filterType, medicines]);

  const handleAddMedicine = () => {
    setSelectedMedicine({
      brandName: "",
      batchNo: "",
      quantity: 0,
      unitPrice: 0,
      stockAlert: 50,
      packSize: "",
      itemStrength: "",
      origin: "",
      expiryDate: "",
      categoryInfo: { name: "", _id: "" },
      genericInfo: { name: "", _id: "" },
      dosageInfo: { dosageInfo: "", _id: "" },
      uomInfo: { name: "", _id: "" },
    });
    setShowModal(true);
  };

  const handleChange = (name: keyof Medicine, value: any) => {
    setSelectedMedicine((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jwt || !selectedMedicine) return;

    const payload = {
      ...selectedMedicine,
      category: selectedMedicine.categoryInfo?._id,
      generic: selectedMedicine.genericInfo?._id,
      dosage: selectedMedicine.dosageInfo?._id,
      unit: selectedMedicine.uomInfo?._id,
    };

    try {
      await axios.post(MEDICINE_URL, payload, { headers: { Authorization: `Bearer ${jwt}` } });
      toast({ title: "✅ Medicine added successfully!" });
      setShowModal(false);
      fetchMedicines();
    } catch (err: any) {
      toast({ title: "❌ Failed to save medicine", description: err?.response?.data?.message || "", variant: "destructive" });
    }
  };

  const getCardColor = (expiryDate?: string) => {
    if (!expiryDate) return "from-white to-blue-50";
    const now = new Date();
    const exp = new Date(expiryDate);
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);
    if (exp < now) return "from-red-100 to-red-200 border-red-400";
    if (exp >= now && exp <= nextMonth) return "from-yellow-100 to-yellow-200 border-yellow-400";
    return "from-white to-blue-50 border-blue-100";
  };

  return (
    <div className="space-y-8 p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-black">
      <Toaster />

      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-blue-100 to-indigo-200 p-4 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-black flex items-center gap-2">
          <Pill className="h-7 w-7 text-black" /> Medicines Dashboard
        </h1>
        <Button onClick={handleAddMedicine} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg flex items-center gap-2">
          <PlusCircle className="h-5 w-5" /> Add Medicine
        </Button>
      </motion.div>

      {/* Search + Filter */}
      <motion.div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-100 p-4 rounded-xl shadow-sm">
        <div className="relative flex-1 min-w-[250px]">
          <Input
            placeholder="Search by brand, category, or generic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-3 border focus:ring rounded-md text-black"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[{ key: "low", label: "Low Stock", icon: <AlertTriangle /> },
            { key: "expired", label: "Expired", icon: <XCircle /> },
            { key: "soon", label: "To Be Expired", icon: <Clock /> },
            { key: "all", label: "All", icon: <Package /> },
          ].map(({ key, label, icon }) => (
            <Button key={key} onClick={() => handleFilter(key)}
              className={`transition flex items-center gap-2 ${filterType === key ? "bg-blue-500 text-white" : "bg-white border text-black hover:bg-blue-100"}`}>
              {icon} {label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Medicines Grid */}
      <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <p className="text-black text-center col-span-full py-6">No medicines found.</p>
        ) : filtered.map((med) => (
          <motion.div key={med._id} className={`p-4 border rounded-xl bg-gradient-to-br ${getCardColor(med.expiryDate)} shadow hover:shadow-lg transition-all duration-200 text-black`}>
            <h2 className="font-semibold text-lg">{med.brandName}</h2>
            <p className="text-sm mt-1">
              {med.genericInfo?.name && `Generic: ${med.genericInfo.name}`}
              {med.categoryInfo?.name && ` | ${med.categoryInfo.name}`}
            </p>
            <p className="text-sm">
              Batch: {med.batchNo || "-"} | Qty: <span className={`${(med.quantity ?? 0) < (med.stockAlert ?? 50) ? "text-red-600 font-bold" : "text-green-600 font-bold"}`}>{med.quantity}</span> | Stock Alert: {med.stockAlert} | Unit Price: ${med.unitPrice ?? 0}
            </p>
            <p className="text-sm">Exp: {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : "-"}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedMedicine && (
          <motion.div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-auto p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl w-full max-w-3xl p-6 sm:p-8 mt-20"
              initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }}>
              <h2 className="text-2xl font-semibold mb-6 text-black text-center">Add New Medicine</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Brand Name" value={selectedMedicine.brandName} onChange={(v) => handleChange("brandName", v)} />
                <InputField label="Batch No" value={selectedMedicine.batchNo} onChange={(v) => handleChange("batchNo", v)} />
                <InputField label="Quantity" type="number" value={selectedMedicine.quantity} onChange={(v) => handleChange("quantity", Number(v))} />
                <InputField label="Unit Price" type="number" value={selectedMedicine.unitPrice} onChange={(v) => handleChange("unitPrice", Number(v))} />
                <InputField label="Stock Alert" type="number" value={selectedMedicine.stockAlert} onChange={(v) => handleChange("stockAlert", Number(v))} />
                <InputField label="Pack Size" value={selectedMedicine.packSize} onChange={(v) => handleChange("packSize", v)} />
                <InputField label="Item Strength" value={selectedMedicine.itemStrength} onChange={(v) => handleChange("itemStrength", v)} />
                <InputField label="Origin" value={selectedMedicine.origin} onChange={(v) => handleChange("origin", v)} />
                <InputField label="Expiry Date" type="date" value={selectedMedicine.expiryDate} onChange={(v) => handleChange("expiryDate", v)} />

                <SelectField label="Category" options={categories} value={selectedMedicine.categoryInfo?._id} onChange={(id) => {
                  const cat = categories.find(c => c._id === id);
                  handleChange("categoryInfo", cat || { name: "", _id: "" });
                }} />
                <SelectField label="Generic" options={generics} value={selectedMedicine.genericInfo?._id} onChange={(id) => {
                  const gen = generics.find(g => g._id === id);
                  handleChange("genericInfo", gen || { name: "", _id: "" });
                }} />
                <SelectField label="Dosage" options={dosages} value={selectedMedicine.dosageInfo?._id} onChange={(id) => {
                  const dos = dosages.find(d => d._id === id);
                  handleChange("dosageInfo", dos || { dosageInfo: "", _id: "" });
                }} />
                <SelectField label="Unit" options={units} value={selectedMedicine.uomInfo?._id} onChange={(id) => {
                  const u = units.find(u => u._id === id);
                  handleChange("uomInfo", u || { name: "", _id: "" });
                }} />

                <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save Medicine</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Input Field
const InputField: React.FC<{ label: string; value: string | number | undefined; onChange: (v: string) => void; type?: string }> = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="block mb-1 font-medium text-black">{label}</label>
    <Input value={value} type={type} onChange={(e) => onChange(e.target.value)} className="border focus:ring rounded-md text-black" />
  </div>
);

// Select Field
const SelectField: React.FC<{ label: string; options: Option[]; value?: string; onChange: (v: string) => void }> = ({ label, options, value, onChange }) => {
  const safeOptions = Array.isArray(options) ? options : [];
  return (
    <div>
      <label className="block mb-1 font-medium text-black">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="border focus:ring rounded-md text-black">
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {safeOptions.map((opt) => (
            <SelectItem key={opt._id} value={opt._id}>{opt.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
