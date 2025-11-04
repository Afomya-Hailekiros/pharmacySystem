"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  AlertTriangle,
  Clock,
  XCircle,
  Pill,
  Package,
  Edit3,
  Trash2,
} from "lucide-react";
import { Medicine, Option, DosageOption } from "./types";
import { MedicineModal } from "./components/MedicineModal";

const MEDICINE_URL =
  "https://pharmacy-management-9ls6.onrender.com/api/v1/medicines";
const CATEGORY_URL =
  "https://pharmacy-management-9ls6.onrender.com/api/v1/categories";
const GENERIC_URL =
  "https://pharmacy-management-9ls6.onrender.com/api/v1/generics";
const DOSAGE_URL =
  "https://pharmacy-management-9ls6.onrender.com/api/v1/dosages";
const UOM_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/UOMs";

export default function MedicinesPage() {
  const { toast } = useToast();
  const [jwt, setJwt] = useState<string | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filtered, setFiltered] = useState<Medicine[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );

  const [categories, setCategories] = useState<Option[]>([]);
  const [generics, setGenerics] = useState<Option[]>([]);
  const [dosages, setDosages] = useState<DosageOption[]>([]);
  const [units, setUnits] = useState<Option[]>([]);

  const calculateTotalQty = (quantity: number, packSize: string | number) =>
    (Number(quantity) || 0) * (Number(packSize) || 1);

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
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setMedicines(data);
      applyFilter(data, filterType);
    } catch {
      toast({
        title: "⚠️ Error Fetching Medicines",
        description: "Failed to fetch medicines.",
        variant: "destructive",
      });
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
    if (type === "low") {
      setFiltered(
        meds.filter(
          (m) =>
            calculateTotalQty(m.quantity ?? 0, m.packSize ?? 1) <
            (m.stockAlert ?? 50)
        )
      );
    } else if (type === "expired") {
      setFiltered(meds.filter((m) => new Date(m.expiryDate || "") < now));
    } else if (type === "soon") {
      const nextMonth = new Date();
      nextMonth.setMonth(now.getMonth() + 1);
      setFiltered(
        meds.filter((m) => {
          const exp = new Date(m.expiryDate || "");
          return exp > now && exp <= nextMonth;
        })
      );
    } else {
      setFiltered(meds);
    }
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
    setFiltered(
      medicines.filter(
        (m) =>
          m.brandName?.toLowerCase().includes(lower) ||
          m.genericInfo?.name?.toLowerCase().includes(lower) ||
          m.categoryInfo?.name?.toLowerCase().includes(lower)
      )
    );
  }, [searchTerm, filterType, medicines]);

  const handleAddMedicine = () => {
    setSelectedMedicine({
      brandName: "",
      batchNo: "",
      quantity: 0,
      unitPrice: 0,
      stockAlert: 50,
      packSize: "1",
      itemStrength: "",
      origin: "",
      expiryDate: "",
      categoryInfo: { name: "", _id: "" },
      genericInfo: { name: "", _id: "" },
      dosageInfo: {
        dosageInfo: "", _id: "",
        name: undefined
      },
      uomInfo: { name: "", _id: "" },
    });
    setShowModal(true);
  };

  const handleChange = (name: keyof Medicine, value: any) => {
    setSelectedMedicine((prev) =>
      prev ? { ...prev, [name]: value } : prev
    );
  };

  const handleSubmit = async () => {
    if (!jwt || !selectedMedicine) return;

    const payload = {
      ...selectedMedicine,
      category: selectedMedicine.categoryInfo?._id,
      generic: selectedMedicine.genericInfo?._id,
      dosage: selectedMedicine.dosageInfo?._id,
      unit: selectedMedicine.uomInfo?._id,
    };

    try {
      if (selectedMedicine._id) {
        await axios.patch(
          `${MEDICINE_URL}/${selectedMedicine._id}`,
          payload,
          { headers: { Authorization: `Bearer ${jwt}` } }
        );
        toast({ title: "✅ Medicine updated successfully!" });
      } else {
        await axios.post(MEDICINE_URL, payload, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        toast({ title: "✅ Medicine added successfully!" });
      }
      setShowModal(false);
      fetchMedicines();
    } catch (err: any) {
      toast({
        title: "❌ Failed to save medicine",
        description: err?.response?.data?.message || "",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id?: string) => {
    if (!jwt || !id) return;
    if (!window.confirm("Are you sure you want to delete this medicine?"))
      return;
    try {
      await axios.delete(`${MEDICINE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      toast({ title: "✅ Medicine deleted successfully!" });
      fetchMedicines();
    } catch (err: any) {
      toast({
        title: "❌ Failed to delete medicine",
        description: err?.response?.data?.message || "",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (med: Medicine) => {
    setSelectedMedicine(med);
    setShowModal(true);
  };

  const getCardColor = (med: Medicine) => {
    const now = new Date();
    const exp = new Date(med.expiryDate || "");
    const totalQty = calculateTotalQty(med.quantity ?? 0, med.packSize ?? 1);
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    if (exp < now)
      return "bg-red-100 dark:bg-red-950 border-red-400 dark:border-red-700";
    if (exp >= now && exp <= nextMonth)
      return "bg-yellow-100 dark:bg-yellow-950 border-yellow-400 dark:border-yellow-700";
    if (totalQty < (med.stockAlert ?? 50))
      return "bg-red-50 dark:bg-red-900 border-red-300 dark:border-red-700";
    return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";
  };

  return (
    <div className="space-y-8 p-6 min-h-screen bg-background text-foreground transition-colors duration-300">
      <Toaster />

      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted dark:bg-gray-800 p-4 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Pill className="h-7 w-7" /> Medicines Dashboard
        </h1>
        <Button
          onClick={handleAddMedicine}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg flex items-center gap-2"
        >
          <PlusCircle className="h-5 w-5" /> Add Medicine
        </Button>
      </motion.div>

      {/* Search + Filter */}
      <motion.div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-muted dark:bg-gray-800 p-4 rounded-xl shadow-sm">
        <div className="relative flex-1 min-w-[250px]">
          <input
            placeholder="Search by brand, category, or generic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-3 border dark:border-gray-700 focus:ring rounded-md bg-background text-foreground w-full"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "low", label: "Low Stock", icon: <AlertTriangle /> },
            { key: "expired", label: "Expired", icon: <XCircle /> },
            { key: "soon", label: "To Be Expired", icon: <Clock /> },
            { key: "all", label: "All", icon: <Package /> },
          ].map(({ key, label, icon }) => (
            <Button
              key={key}
              onClick={() => handleFilter(key)}
              className={`transition flex items-center gap-2 ${
                filterType === key
                  ? "bg-blue-500 text-white"
                  : "bg-background border dark:border-gray-700 text-foreground hover:bg-accent"
              }`}
            >
              {icon} {label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Medicines Grid */}
      <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <p className="text-center col-span-full py-6">
            No medicines found.
          </p>
        ) : (
          filtered.map((med) => (
            <motion.div
              key={med._id}
              className={`p-4 border rounded-xl ${getCardColor(
                med
              )} shadow hover:shadow-lg transition-all duration-200`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-lg">
                    {med.brandName}
                  </h2>
                  <p className="text-sm mt-1">
                    {med.genericInfo?.name &&
                      `Generic: ${med.genericInfo.name}`}
                    {med.categoryInfo?.name &&
                      ` | ${med.categoryInfo.name}`}
                  </p>
                  <p className="text-sm">
                    Batch: {med.batchNo || "-"} | Total Qty:{" "}
                    <span
                      className={`${
                        calculateTotalQty(
                          med.quantity ?? 0,
                          med.packSize ?? 1
                        ) < (med.stockAlert ?? 50)
                          ? "text-red-600 dark:text-red-400 font-bold"
                          : "text-green-600 dark:text-green-400 font-bold"
                      }`}
                    >
                      {calculateTotalQty(
                        med.quantity ?? 0,
                        med.packSize ?? 1
                      )}
                    </span>{" "}
                    | Stock Alert: {med.stockAlert} | Unit Price: $
                    {med.unitPrice ?? 0}
                  </p>
                  <p className="text-sm">
                    Exp:{" "}
                    {med.expiryDate
                      ? new Date(med.expiryDate).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div className="flex flex-col gap-2 ml-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(med)}
                  >
                    <Edit3 size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(med._id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedMedicine && (
          <MedicineModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            medicine={selectedMedicine}
            categories={categories}
            generics={generics}
            dosages={dosages}
            uoms={units}
            onChange={handleChange}
            onSave={handleSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
