"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select from "react-select";
import {
  PlusCircle,
  Pill,
  Search,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

interface MedicineType {
  _id: string;
  brandName: string;
  category: string;
  generic: string;
  dosage: string;
  unit: string;
  batchNo: string;
  expiryDate?: string;
  quantity: number;
  unitPrice: number;
  stockAlert?: number;
  packSize?: string;
  itemStrength?: string;
  origin?: string;
  categoryInfo?: { name: string };
  genericInfo?: { name: string };
}

interface Option {
  _id: string;
  name: string;
}

export default function MedicinesDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jwt, setJwt] = useState<string | null>(null);
  const [medicines, setMedicines] = useState<MedicineType[]>([]);
  const [filtered, setFiltered] = useState<MedicineType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineType | null>(null);

  const [categories, setCategories] = useState<Option[]>([]);
  const [generics, setGenerics] = useState<Option[]>([]);
  const [dosages, setDosages] = useState<Option[]>([]);
  const [uoms, setUoms] = useState<Option[]>([]);

  const [form, setForm] = useState({
    category: "",
    generic: "",
    brandName: "",
    dosage: "",
    unit: "",
    batchNo: "",
    expiryDate: "",
    quantity: "",
    unitPrice: "",
    stockAlert: "",
    packSize: "",
    itemStrength: "",
    origin: "",
  });

  const MEDICINE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/medicines";
  const CATEGORY_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/categories";
  const GENERIC_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/generics";
  const DOSAGE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/dosages";
  const UOM_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/UOMs";

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "white",
      borderColor: state.isFocused ? "#2563eb" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : "none",
      "&:hover": { borderColor: "#2563eb" },
      minHeight: "42px",
    }),
    menu: (provided: any) => ({ ...provided, backgroundColor: "white", zIndex: 50 }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#2563eb"
        : state.isFocused
        ? "#e0f2fe"
        : "white",
      color: state.isSelected ? "white" : "black",
    }),
    singleValue: (provided: any) => ({ ...provided, color: "black" }),
  };

  useEffect(() => {
    const getCookie = (name: string) => {
      const cookies = document.cookie.split("; ");
      for (const cookie of cookies) {
        const [key, ...rest] = cookie.split("=");
        if (key === name) return decodeURIComponent(rest.join("="));
      }
      return undefined;
    };
    setJwt(getCookie("jwt") || null);
  }, []);

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
      setUoms(uo.data.data.units || []);
    } catch {
      toast({ title: "❌ Error", description: "Failed to load dropdowns", variant: "destructive" });
    }
  };

  const fetchMedicines = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(MEDICINE_URL, { headers: { Authorization: `Bearer ${jwt}` } });
      setMedicines(res.data.data || []);
      setFiltered(res.data.data || []);
    } catch {
      toast({ title: "⚠️ Error", description: "Failed to fetch medicines.", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (jwt) {
      fetchDropdowns();
      fetchMedicines();
    }
  }, [jwt]);

  const mapOptions = (arr: Option[]) => arr.map((o) => ({ value: o._id, label: o.name }));
  const handleChange = (name: string, value: any) => setForm({ ...form, [name]: value });

  const handleAddMedicine = () => {
    setSelectedMedicine(null);
    setForm({
      category: "",
      generic: "",
      brandName: "",
      dosage: "",
      unit: "",
      batchNo: "",
      expiryDate: "",
      quantity: "",
      unitPrice: "",
      stockAlert: "",
      packSize: "",
      itemStrength: "",
      origin: "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jwt) return;

    const payload = {
      ...form,
      quantity: parseInt(form.quantity),
      unitPrice: parseFloat(form.unitPrice),
      stockAlert: parseInt(form.stockAlert),
    };

    try {
      if (selectedMedicine) {
        await axios.put(`${MEDICINE_URL}/${selectedMedicine._id}`, payload, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        toast({ title: "✅ Medicine updated successfully!" });
      } else {
        await axios.post(MEDICINE_URL, payload, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        toast({ title: "✅ Medicine added successfully!" });
      }
      setShowModal(false);
      fetchMedicines();
    } catch {
      toast({ title: "❌ Failed to save medicine", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) return setFiltered(medicines);
    const lower = searchTerm.toLowerCase();
    setFiltered(
      medicines.filter(
        (m) =>
          m.brandName?.toLowerCase().includes(lower) ||
          m.genericInfo?.name?.toLowerCase().includes(lower) ||
          m.categoryInfo?.name?.toLowerCase().includes(lower)
      )
    );
  }, [searchTerm, medicines]);

  return (
    <div className="space-y-8 p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-black">
      <Toaster />

      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
          <Pill className="h-7 w-7 text-blue-600" /> Medicines Dashboard
        </h1>
        <Button
          onClick={handleAddMedicine}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" /> Add Medicine
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-3 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search by brand, category, or generic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-blue-200 focus:ring-blue-400 text-black"
          />
        </div>
      </motion.div>

      {/* Medicines List */}
      <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center col-span-full py-6">No medicines found.</p>
        ) : (
          filtered.map((med) => (
            <motion.div
              key={med._id}
              layout
              className="p-4 border rounded-xl bg-gradient-to-br from-white to-blue-50 shadow hover:shadow-lg transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="font-semibold text-blue-900 text-lg">{med.brandName}</h2>
                  <p className="text-sm text-blue-800 mt-1">
                    {med.genericInfo?.name && `Generic: ${med.genericInfo.name}`}
                    {med.categoryInfo?.name && ` | ${med.categoryInfo.name}`}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                Batch: {med.batchNo || "-"} | Qty:{" "}
                <span className={(med.quantity ?? 0) < (med.stockAlert ?? 50) ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                  {med.quantity}
                </span>{" "}
                | Pack Size: {med.packSize || "-"}
              </p>
              <p className="text-sm text-gray-700">
                Exp: {med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : "-"} | Strength: {med.itemStrength || "-"} | Origin: {med.origin || "-"}
              </p>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-auto p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 sm:p-8 mt-20"
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: -50 }}
            >
              <h2 className="text-2xl font-semibold mb-6 text-blue-700 text-center">
                {selectedMedicine ? "Edit Medicine" : "Add New Medicine"}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
                {/* Category, Generic, Brand, Dosage, Unit */}
                <div>
                  <label className="block text-gray-800 font-medium mb-1">Category</label>
                  <Select
                    styles={customStyles}
                    options={mapOptions(categories)}
                    value={mapOptions(categories).find((o) => o.value === form.category) || null}
                    onChange={(option: any) => handleChange("category", option?.value || "")}
                    placeholder="Select category"
                    isClearable
                  />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-1">Generic</label>
                  <Select
                    styles={customStyles}
                    options={mapOptions(generics)}
                    value={mapOptions(generics).find((o) => o.value === form.generic) || null}
                    onChange={(option: any) => handleChange("generic", option?.value || "")}
                    placeholder="Select generic"
                    isClearable
                  />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-1">Brand Name</label>
                  <Input value={form.brandName} onChange={(e) => handleChange("brandName", e.target.value)} required />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-1">Dosage</label>
                  <Select
                    styles={customStyles}
                    options={mapOptions(dosages)}
                    value={mapOptions(dosages).find((o) => o.value === form.dosage) || null}
                    onChange={(option: any) => handleChange("dosage", option?.value || "")}
                    placeholder="Select dosage"
                    isClearable
                  />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-1">Unit</label>
                  <Select
                    styles={customStyles}
                    options={mapOptions(uoms)}
                    value={mapOptions(uoms).find((o) => o.value === form.unit) || null}
                    onChange={(option: any) => handleChange("unit", option?.value || "")}
                    placeholder="Select unit"
                    isClearable
                  />
                </div>

                {/* Batch, Expiry, Quantity, Unit Price, StockAlert */}
                <div>
                  <label className="block text-gray-800 font-medium mb-1">Batch No</label>
                  <Input value={form.batchNo} onChange={(e) => handleChange("batchNo", e.target.value)} required />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-1">Expiry Date</label>
                  <Input type="date" value={form.expiryDate} onChange={(e) => handleChange("expiryDate", e.target.value)} />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-1">Quantity</label>
                  <Input type="number" value={form.quantity} onChange={(e) => handleChange("quantity", e.target.value)} required />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-1">Unit Price</label>
                  <Input type="number" value={form.unitPrice} onChange={(e) => handleChange("unitPrice", e.target.value)} required />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-1">Stock Alert</label>
                  <Input type="number" value={form.stockAlert} onChange={(e) => handleChange("stockAlert", e.target.value)} required />
                </div>

                {/* Pack Size, Item Strength, Origin */}
                <div>
                  <label className="block text-gray-800 font-medium mb-1">Pack Size</label>
                  <Input value={form.packSize} onChange={(e) => handleChange("packSize", e.target.value)} />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-1">Item Strength</label>
                  <Input value={form.itemStrength} onChange={(e) => handleChange("itemStrength", e.target.value)} required />
                </div>
                <div>
                  <label className="block text-gray-800 font-medium mb-1">Origin</label>
                  <Input value={form.origin} onChange={(e) => handleChange("origin", e.target.value)} required />
                </div>

                <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" className="text-black border-gray-400 hover:bg-gray-100" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">{selectedMedicine ? "Update Medicine" : "Save Medicine"}</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
