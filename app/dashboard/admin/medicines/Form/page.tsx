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

interface Option {
  _id: string;
  name: string;
}

export default function MedicineForm() {
  const { toast } = useToast();

  const [jwt, setJwt] = useState<string | null>(null);
  const [categories, setCategories] = useState<Option[]>([]);
  const [generics, setGenerics] = useState<Option[]>([]);
  const [dosages, setDosages] = useState<Option[]>([]);
  const [uoms, setUoms] = useState<Option[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);

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

  // Fetch dropdown data
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
        description: "Failed to load dropdown data.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (jwt) fetchData();
  }, [jwt]);

  // Handle input changes
  const handleChange = (name: string, value: any) => {
    setForm({ ...form, [name]: value });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jwt) return;

    const exists = medicines.find(
      (m) => m.brandName.toLowerCase() === form.brandName.toLowerCase()
    );

    if (exists && exists.batchNo === form.batchNo) {
      const newQty = exists.quantity + parseInt(form.quantity);
      try {
        await axios.put(`${MEDICINE_URL}/${exists._id}`, { quantity: newQty }, { headers: { Authorization: `Bearer ${jwt}` } });
        toast({ title: "✅ Quantity updated successfully!" });
      } catch {
        toast({ title: "❌ Failed to update quantity", variant: "destructive" });
      }
      return;
    }

    try {
      await axios.post(MEDICINE_URL, {
        ...form,
        quantity: parseInt(form.quantity),
        unitPrice: parseFloat(form.unitPrice),
      }, { headers: { Authorization: `Bearer ${jwt}` } });
      toast({ title: "✅ Medicine added successfully!" });
    } catch {
      toast({ title: "❌ Failed to add medicine", variant: "destructive" });
    }
  };

  // Helper to convert Option[] to react-select format
  const mapOptions = (arr: Option[]) => arr.map((o) => ({ value: o._id, label: o.name }));

  return (
    <Card className="max-w-3xl mx-auto mt-6 shadow-lg">
      <CardContent className="p-6">
        <Toaster />
        <h2 className="text-2xl font-bold mb-6 text-blue-700">Add Medicine</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Category */}
          <div>
            <Label>Category</Label>
            <Select
              options={mapOptions(categories)}
              onChange={(option: any) => handleChange("category", option?.value || "")}
              placeholder="Select category"
              isClearable
            />
          </div>

          {/* Generic */}
          <div>
            <Label>Generic</Label>
            <Select
              options={mapOptions(generics)}
              onChange={(option: any) => handleChange("generic", option?.value || "")}
              placeholder="Select generic"
              isClearable
            />
          </div>

          {/* Brand Name */}
          <div>
            <Label>Brand Name</Label>
            <Input
              name="brandName"
              value={form.brandName}
              onChange={(e) => handleChange("brandName", e.target.value)}
              required
            />
          </div>

          {/* Dosage */}
          <div>
            <Label>Dosage</Label>
            <Select
              options={mapOptions(dosages)}
              onChange={(option: any) => handleChange("dosage", option?.value || "")}
              placeholder="Select dosage"
              isClearable
            />
          </div>

          {/* Unit of Measure */}
          <div>
            <Label>Unit of Measure</Label>
            <Select
              options={mapOptions(uoms)}
              onChange={(option: any) => handleChange("unit", option?.value || "")}
              placeholder="Select unit"
              isClearable
            />
          </div>

          {/* Origin */}
          <div>
            <Label>Origin</Label>
            <Input
              name="origin"
              value={form.origin}
              onChange={(e) => handleChange("origin", e.target.value)}
            />
          </div>

          {/* Item Strength */}
          <div>
            <Label>Item Strength</Label>
            <Input
              name="itemStrength"
              value={form.itemStrength}
              onChange={(e) => handleChange("itemStrength", e.target.value)}
            />
          </div>

          {/* Pack Size */}
          <div>
            <Label>Pack Size</Label>
            <Input
              name="packSize"
              value={form.packSize}
              onChange={(e) => handleChange("packSize", e.target.value)}
            />
          </div>

          {/* Batch No */}
          <div>
            <Label>Batch No</Label>
            <Input
              name="batchNo"
              value={form.batchNo}
              onChange={(e) => handleChange("batchNo", e.target.value)}
              required
            />
          </div>

          {/* Expiry Date */}
          <div>
            <Label>Expiry Date</Label>
            <Input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={(e) => handleChange("expiryDate", e.target.value)}
            />
          </div>

          {/* Quantity */}
          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={(e) => handleChange("quantity", e.target.value)}
            />
          </div>

          {/* Unit Price */}
          <div>
            <Label>Unit Price</Label>
            <Input
              type="number"
              name="unitPrice"
              value={form.unitPrice}
              onChange={(e) => handleChange("unitPrice", e.target.value)}
            />
          </div>

          <div className="col-span-2 flex justify-end mt-4">
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg">
              Save Medicine
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
