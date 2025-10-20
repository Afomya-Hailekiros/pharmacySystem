"use client";

import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-6">
      <ShieldAlert className="text-red-500 w-16 h-16 mb-4" />
      <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-6 max-w-md">
        You don’t have permission to access this page. Only admins can perform this action.
      </p>
      <Button onClick={() => router.push("/login")} className="bg-blue-600 text-white hover:bg-blue-700">
        Back to Login
      </Button>
    </div>
  );
}
