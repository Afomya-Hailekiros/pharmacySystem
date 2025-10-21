// app/dashboard/admin/page.tsx
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Users, Pill, BarChart3, List } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCookie } from "@/utils/getCookie";

// ✅ Define the Category type
interface Category {
  _id: string;
  name: string;
}

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("jwt")?.value;
  const role = cookieStore.get("role")?.value;

  // Redirect if not logged in or not admin
  if (!jwt || role !== "admin") redirect("/unauthorized");

  // ✅ Fetch categories safely
  let categories: Category[] = [];
  try {
    const res = await fetch(
      "https://pharmacy-management-9ls6.onrender.com/api/v1/category",
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) throw new Error("Failed to fetch categories");

    const data = await res.json();

    // ✅ Safely check the shape of the response
    if (data && Array.isArray(data.data)) {
      categories = data.data;
    } else {
      categories = [];
    }
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    categories = [];
  }

  // ✅ Dashboard cards
  const cards = [
    { title: "Total Users", value: "12", icon: Users },
    { title: "Medicines in Stock", value: "234", icon: Pill },
    { title: "Weekly Sales", value: "$4,520", icon: BarChart3 },
    { title: "Categories", value: categories.length.toString(), icon: List },
  ];

  // ✅ Render dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-blue-700">
          Admin Dashboard
        </h1>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((card) => (
          <DashboardCard key={card.title} {...card} />
        ))}
      </div>

      {/* Category List */}
      <div>
        <h2 className="text-lg font-semibold mt-8 mb-3 text-gray-700">
          Categories
        </h2>

        <ul className="space-y-2">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <li
                key={cat._id}
                className="p-3 border rounded-lg bg-gray-50 text-gray-700"
              >
                {cat.name}
              </li>
            ))
          ) : (
            <p className="text-gray-500">No categories found.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
