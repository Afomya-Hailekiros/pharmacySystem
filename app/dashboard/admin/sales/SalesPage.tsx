"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Package, BarChart3 } from "lucide-react";
import SaleModal from "./SaleModal";
import SaleCard from "./SaleCard";
import { Sale, MedicineOption } from "./types";
import { useRouter } from "next/navigation";

const SALES_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/sales";
const MEDICINES_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/medicines";

export default function SalesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [jwt, setJwt] = useState<string | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [filtered, setFiltered] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [medicines, setMedicines] = useState<MedicineOption[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalProfit, setTotalProfit] = useState<number>(0);

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

  const fetchSales = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(SALES_URL, {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      const data: Sale[] = Array.isArray(res.data.data.sales)
        ? res.data.data.sales
        : [];

      setSales(data);
      setFiltered(data);

      const revenueSum = data.reduce((sum, s) => {
        const sellingPrice = s.sellingPrice || s.medicineInfo.retailPrice || 0;
        const discount = s.discount || 0;
        const priceAfterDiscount = Math.max(sellingPrice - discount, 0);
        return sum + priceAfterDiscount * s.quantity;
      }, 0);

      const profitSum = data.reduce((sum, s) => {
        const sellingPrice = s.sellingPrice || s.medicineInfo.retailPrice || 0;
        const unitCost = s.medicineInfo.unitPrice || 0;
        const discount = s.discount || 0;
        const profitPerItem = Math.max(sellingPrice - unitCost - discount, 0);
        return sum + profitPerItem * s.quantity;
      }, 0);

      setTotalRevenue(revenueSum);
      setTotalProfit(profitSum);
    } catch {
      toast({
        title: "⚠️ Error Fetching Sales",
        description: "Failed to fetch sales.",
        variant: "destructive",
      });
    }
  };

  const fetchMedicines = async () => {
    if (!jwt) return;
    try {
      const res = await axios.get(MEDICINES_URL, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setMedicines(res.data.data || []);
    } catch {
      toast({
        title: "❌ Error",
        description: "Failed to load medicines.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (jwt) {
      fetchSales();
      fetchMedicines();
    }
  }, [jwt]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) return setFiltered(sales);

    const lower = term.toLowerCase();
    setFiltered(
      sales.filter(
        (s) =>
          s.medicineInfo.brandName.toLowerCase().includes(lower) ||
          s.medicineInfo.batchNo?.toLowerCase().includes(lower) ||
          s.medicineInfo.categoryInfo?.name?.toLowerCase().includes(lower) ||
          s.medicineInfo.genericInfo?.name?.toLowerCase().includes(lower)
      )
    );
  };

  const createEmptySale = (): Sale => ({
    medicineInfo: {
      _id: "",
      brandName: "",
      quantity: 0,
      unitPrice: 0,
      retailPrice: 0,
    },
    medicine: "",
    quantity: 0,
    discount: 0,
    totalRevenuePrice: 0,
    profit: 0,
    status: "pending",
    soldByInfo: { _id: "", userName: "" },
    soldBy: "",
    saleDate: new Date().toISOString(),
    sellingPrice: 0,
    paymentMethod: "",
  });

  return (
    <div className="space-y-8 p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-black dark:from-gray-900 dark:to-gray-950 dark:text-gray-100 transition-colors duration-300">
      <Toaster />

      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-blue-100 to-indigo-200 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-7 w-7 text-blue-600 dark:text-indigo-400" /> Sales Dashboard
        </h1>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              setSelectedSale(createEmptySale());
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold shadow-lg flex items-center gap-2"
          >
            <PlusCircle className="h-5 w-5" /> Add Sale
          </Button>

          
        </div>
      </motion.div>

      {/* Search + Totals */}
      <motion.div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl shadow-sm">
        <Input
          placeholder="Search by medicine, batch, category, generic..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 border dark:border-gray-600 focus:ring rounded-md bg-white dark:bg-gray-900 text-black dark:text-white"
        />
        <div className="flex flex-col sm:flex-row gap-4 font-bold text-lg text-black dark:text-gray-200">
          <span>Total Revenue: ${totalRevenue.toFixed(2)}</span>
          <span>Total Profit: ${totalProfit.toFixed(2)}</span>
        </div>
      </motion.div>

      {/* Sales Grid */}
      <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <p className="text-center col-span-full py-6 dark:text-gray-300">
            No sales found.
          </p>
        ) : (
          filtered.map((sale) => (
            <SaleCard
              key={sale._id}
              sale={sale}
              fetchSales={fetchSales}
              setSelectedSale={setSelectedSale}
              setShowModal={setShowModal}
              jwt={jwt}
            />
          ))
        )}
      </motion.div>

      {/* Sale Modal */}
      <SaleModal
        show={showModal}
        setShow={setShowModal}
        sale={selectedSale}
        setSale={setSelectedSale}
        medicines={medicines}
        fetchSales={fetchSales}
        jwt={jwt}
      />
    </div>
  );
}
