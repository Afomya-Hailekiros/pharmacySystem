"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast"; // ✅ use your toast provider
import { Toaster } from "@/components/ui/toaster";    // ✅ render toaster

// Utility to read cookie
function getCookie(name: string) {
  const matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" +
        name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

interface User {
  _id: string;
  userName: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editData, setEditData] = useState({ userName: "", email: "", role: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = getCookie("jwt");
      const res = await axios.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUsers(res.data.data.users);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        toast({
          title: "⚠️ Unauthorized",
          description: "Please log in again.",
          variant: "destructive",
        });
        router.push("/login");
      } else {
        toast({
          title: "⚠️ Error",
          description: "Failed to fetch users.",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = getCookie("jwt");
      await axios.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      toast({
        title: "✅ Deleted",
        description: "User deleted successfully.",
        variant: "success",
      });
      setUsers(users.filter((u) => u._id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast({
          title: "⚠️ Unauthorized",
          description: "Please log in again.",
          variant: "destructive",
        });
        router.push("/login");
      } else {
        toast({
          title: "⚠️ Error",
          description: "Failed to delete user.",
          variant: "destructive",
        });
      }
    }
  };

  // Start editing
  const handleEdit = (user: User) => {
    setEditingUser(user._id);
    setEditData({ userName: user.userName, email: user.email, role: user.role });
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingUser(null);
    setEditData({ userName: "", email: "", role: "" });
  };

  // Save edited user
  const handleSave = async (id: string) => {
    setLoading(true);
    try {
      const token = getCookie("jwt");
      await axios.put(`/users/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      toast({
        title: "✅ Updated",
        description: "User updated successfully.",
        variant: "success",
      });
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast({
          title: "⚠️ Unauthorized",
          description: "Please log in again.",
          variant: "destructive",
        });
        router.push("/login");
      } else {
        toast({
          title: "⚠️ Error",
          description: "Failed to update user.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-8">
      <Toaster /> {/* ✅ render Toaster */}
      <Card className="max-w-5xl mx-auto shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h1 className="text-3xl font-semibold text-blue-700 mb-6 text-center">
            Manage Users
          </h1>

          {users.length === 0 ? (
            <p className="text-center text-gray-500">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white text-left">
                    <th className="p-3">Username</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-blue-50">
                      {editingUser === user._id ? (
                        <>
                          <td className="p-3">
                            <Input
                              value={editData.userName}
                              onChange={(e) =>
                                setEditData({ ...editData, userName: e.target.value })
                              }
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              value={editData.email}
                              onChange={(e) =>
                                setEditData({ ...editData, email: e.target.value })
                              }
                            />
                          </td>
                          <td className="p-3">
                            <select
                              value={editData.role}
                              onChange={(e) =>
                                setEditData({ ...editData, role: e.target.value })
                              }
                              className="border border-gray-300 rounded-lg p-2"
                            >
                              <option value="admin">Admin</option>
                              <option value="pharmacist">Pharmacist</option>
                              <option value="customer">Customer</option>
                            </select>
                          </td>
                          <td className="p-3 text-center flex gap-2 justify-center">
                            <Button
                              size="sm"
                              onClick={() => handleSave(user._id)}
                              disabled={loading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save size={16} className="mr-1" /> Save
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={handleCancel}
                            >
                              <X size={16} className="mr-1" /> Cancel
                            </Button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3">{user.userName}</td>
                          <td className="p-3">{user.email}</td>
                          <td className="p-3">{user.role}</td>
                          <td className="p-3 text-center flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEdit(user)}
                            >
                              <Pencil size={16} className="mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(user._id)}
                            >
                              <Trash2 size={16} className="mr-1" /> Delete
                            </Button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
