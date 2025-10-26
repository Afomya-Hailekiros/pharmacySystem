"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent } from "@/components/ui/card";
import Select from "react-select";
import { useSearchParams, useRouter } from "next/navigation";

interface Option {
  _id: string;
  name: string;
}

interface MedicineType {
  _id: string;
  brandName: string;
  category: string;
  generic: string;
  dosage: string;
  unit: string;
  origin?: string;
  itemStrength?: string;
  packSize?: string;
  batchNo: string;
  expiryDate?: string;
  quantity: number;
  unitPrice: number;
}

export default function MedicineForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [jwt, setJwt] = useState<string | null>(null);

  // Dropdowns
  const [categories, setCategories] = useState<Option[]>([]);
  const [generics, setGenerics] = useState<Option[]>([]);
  const [dosages, setDosages] = useState<Option[]>([]);
  const [uoms, setUoms] = useState<Option[]>([]);

  // All medicines (for search)
  const [medicines, setMedicines] = useState<MedicineType[]>([]);

  // Selected medicine from search or edit
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineType | null>(null);

  // Form state
  const [form, setForm] = useState({
    category: "",
    generic: "",
    brandName: "",
    dosage: "",
    unit: "",
    origin: "",
    itemStrength: "",
    packSize: "",
    batchNo: "",
    expiryDate: "",
    quantity: "",
    unitPrice: "",
  });

  const CATEGORY_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/categories";
  const GENERIC_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/generics";
  const DOSAGE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/dosages";
  const UOM_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/UOMs";
  const MEDICINE_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/medicines";

  // react-select custom styles
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "white",
      borderColor: state.isFocused ? "#2563eb" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : "none",
      "&:hover": { borderColor: "#2563eb" },
      minHeight: "42px",
    }),
    menu: (provided: any) => ({ ...provided, backgroundColor: "white", zIndex: 20 }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#2563eb"
        : state.isFocused
        ? "#e0f2fe"
        : "white",
      color: state.isSelected ? "white" : "black",
      "&:active": { backgroundColor: "#1d4ed8", color: "white" },
    }),
    singleValue: (provided: any) => ({ ...provided, color: "black" }),
    placeholder: (provided: any) => ({ ...provided, color: "#6b7280" }),
  };

  // Load JWT
  useEffect(() => {
    const getCookie = (name: string) => {
      const cookies = document.cookie.split("; ");
      for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) return decodeURIComponent(value);
      }
      return undefined;
    };
    setJwt(getCookie("jwt") || null);
  }, []);

  // Fetch all dropdowns + medicines
  const fetchData = async () => {
    if (!jwt) return;
    try {
      const [cats, gens, dos, uo, meds] = await Promise.all([
        axios.get(CATEGORY_URL, { headers: { Authorization: `Bearer ${jwt}` } }),
        axios.get(GENERIC_URL, { headers: { Authorization: `Bearer ${jwt}` } }),
        axios.get(DOSAGE_URL, { headers: { Authorization: `Bearer ${jwt}` } }),
        axios.get(UOM_URL, { headers: { Authorization: `Bearer ${jwt}` } }),
        axios.get(MEDICINE_URL, { headers: { Authorization: `Bearer ${jwt}` } }),
      ]);

      setCategories(cats.data.data.categories || []);
      setGenerics(gens.data.data.generics || []);
      setDosages(dos.data.data.dosages || []);
      setUoms(uo.data.data.units || []);
      setMedicines(meds.data.data || []);
    } catch {
      toast({
        title: "❌ Error",
        description: "Failed to load data.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (jwt) fetchData();
  }, [jwt]);

  // Prefill form if editing via URL
  useEffect(() => {
    const medicineId = searchParams.get("id");
    if (!medicineId || !medicines.length) return;

    const med = medicines.find((m) => m._id === medicineId);
    if (med) {
      setSelectedMedicine(med);
      setForm({
        category: med.category,
        generic: med.generic,
        brandName: med.brandName,
        dosage: med.dosage,
        unit: med.unit,
        origin: med.origin || "",
        itemStrength: med.itemStrength || "",
        packSize: med.packSize || "",
        batchNo: med.batchNo,
        expiryDate: med.expiryDate || "",
        quantity: med.quantity.toString(),
        unitPrice: med.unitPrice.toString(),
      });
    }
  }, [searchParams, medicines]);

  const handleChange = (name: string, value: any) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jwt) return;

    try {
      if (selectedMedicine) {
        // Update existing medicine
        await axios.put(
          `${MEDICINE_URL}/${selectedMedicine._id}`,
          {
            ...form,
            quantity: parseInt(form.quantity),
            unitPrice: parseFloat(form.unitPrice),
          },
          { headers: { Authorization: `Bearer ${jwt}` } }
        );
        toast({ title: "✅ Medicine updated successfully!" });
      } else {
        // Add new medicine
        await axios.post(
          MEDICINE_URL,
          {
            ...form,
            quantity: parseInt(form.quantity),
            unitPrice: parseFloat(form.unitPrice),
          },
          { headers: { Authorization: `Bearer ${jwt}` } }
        );
        toast({ title: "✅ Medicine added successfully!" });
      }

      router.push("/dashboard/admin/medicines");
    } catch {
      toast({ title: "❌ Failed to save medicine", variant: "destructive" });
    }
  };

  const mapOptions = (arr: Option[]) => arr.map((o) => ({ value: o._id, label: o.name }));
  const mapMedicineOptions = medicines.map((m) => ({
    value: m._id,
    label: `${m.brandName} | ${m.generic} | Batch: ${m.batchNo}`,
  }));

  // Auto-fill form when selecting medicine from search
  const handleSelectMedicine = (option: any) => {
    if (!option) {
      setSelectedMedicine(null);
      setForm({
        category: "",
        generic: "",
        brandName: "",
        dosage: "",
        unit: "",
        origin: "",
        itemStrength: "",
        packSize: "",
        batchNo: "",
        expiryDate: "",
        quantity: "",
        unitPrice: "",
      });
      return;
    }

    const med = medicines.find((m) => m._id === option.value);
    if (med) {
      setSelectedMedicine(med);
      setForm({
        category: med.category,
        generic: med.generic,
        brandName: med.brandName,
        dosage: med.dosage,
        unit: med.unit,
        origin: med.origin || "",
        itemStrength: med.itemStrength || "",
        packSize: med.packSize || "",
        batchNo: med.batchNo,
        expiryDate: med.expiryDate || "",
        quantity: "", // optional: user adds new quantity
        unitPrice: med.unitPrice.toString(),
      });
    }
  };

  return (
    <Card className="max-w-3xl mx-auto mt-10 shadow-xl rounded-2xl border border-gray-200">
      <CardContent className="p-8">
        <Toaster />
        <h2 className="text-3xl font-semibold mb-8 text-blue-700 text-center">
          {selectedMedicine ? "Edit Medicine" : "Add New Medicine"}
        </h2>

        {/* Search existing medicine */}
        <div className="mb-6">
          <Label className="text-gray-700 font-medium">Search Existing Medicine</Label>
          <Select
            styles={customStyles}
            options={mapMedicineOptions}
            onChange={handleSelectMedicine}
            isClearable
            placeholder="Search by brand, generic, or batch..."
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <Label className="text-gray-700 font-medium">Category</Label>
            <Select
              styles={customStyles}
              options={mapOptions(categories)}
              value={mapOptions(categories).find((o) => o.value === form.category) || null}
              onChange={(option: any) => handleChange("category", option?.value || "")}
              placeholder="Select category"
              isClearable
            />
          </div>

          {/* Generic */}
          <div>
            <Label className="text-gray-700 font-medium">Generic</Label>
            <Select
              styles={customStyles}
              options={mapOptions(generics)}
              value={mapOptions(generics).find((o) => o.value === form.generic) || null}
              onChange={(option: any) => handleChange("generic", option?.value || "")}
              placeholder="Select generic"
              isClearable
            />
          </div>

          {/* Brand Name */}
          <div>
            <Label className="text-gray-700 font-medium">Brand Name</Label>
            <Input
              name="brandName"
              value={form.brandName}
              onChange={(e) => handleChange("brandName", e.target.value)}
              required
            />
          </div>

          {/* Dosage */}
          <div>
            <Label className="text-gray-700 font-medium">Dosage</Label>
            <Select
              styles={customStyles}
              options={mapOptions(dosages)}
              value={mapOptions(dosages).find((o) => o.value === form.dosage) || null}
              onChange={(option: any) => handleChange("dosage", option?.value || "")}
              placeholder="Select dosage"
              isClearable
            />
          </div>

          {/* Unit */}
          <div>
            <Label className="text-gray-700 font-medium">Unit of Measure</Label>
            <Select
              styles={customStyles}
              options={mapOptions(uoms)}
              value={mapOptions(uoms).find((o) => o.value === form.unit) || null}
              onChange={(option: any) => handleChange("unit", option?.value || "")}
              placeholder="Select unit"
              isClearable
            />
          </div>

          {/* Other inputs */}
          <div>
            <Label className="text-gray-700 font-medium">Origin</Label>
            <Input
              name="origin"
              value={form.origin}
              onChange={(e) => handleChange("origin", e.target.value)}
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Item Strength</Label>
            <Input
              name="itemStrength"
              value={form.itemStrength}
              onChange={(e) => handleChange("itemStrength", e.target.value)}
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Pack Size</Label>
            <Input
              name="packSize"
              value={form.packSize}
              onChange={(e) => handleChange("packSize", e.target.value)}
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Batch No</Label>
            <Input
              name="batchNo"
              value={form.batchNo}
              onChange={(e) => handleChange("batchNo", e.target.value)}
              required
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Expiry Date</Label>
            <Input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={(e) => handleChange("expiryDate", e.target.value)}
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Quantity</Label>
            <Input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={(e) => handleChange("quantity", e.target.value)}
              required
            />
          </div>

          <div>
            <Label className="text-gray-700 font-medium">Unit Price</Label>
            <Input
              type="number"
              name="unitPrice"
              value={form.unitPrice}
              onChange={(e) => handleChange("unitPrice", e.target.value)}
            />
          </div>

          <div className="col-span-2 flex justify-end mt-6">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg shadow-md transition"
            >
              {selectedMedicine ? "Update Medicine" : "Save Medicine"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
