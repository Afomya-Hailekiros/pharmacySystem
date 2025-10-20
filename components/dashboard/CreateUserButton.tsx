// components/dashboard/CreateUserButton.tsx
"use client";

import { UserPlus } from "lucide-react";

export default function CreateUserButton() {
  return (
    <button
      onClick={() => (window.location.href = "/signup")}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
    >
      <UserPlus size={18} /> Create User
    </button>
  );
}
