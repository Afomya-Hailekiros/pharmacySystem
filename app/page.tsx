"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-4">
        Welcome to Pharmacy Management System
      </h1>
      <p className="text-gray-600 mb-8 max-w-md">
        Please log in to continue. Account creation is managed by the admin only.
      </p>

      <Button
        className="bg-blue-600 hover:bg-blue-700 text-white px-6"
        onClick={() => router.push("/login")}
      >
        Login
      </Button>
    </main>
  );
}
