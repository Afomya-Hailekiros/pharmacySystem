"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast"; // ✅ use your manual toast hook
import { Toaster } from "@/components/ui/toaster";   // ✅ make sure Toaster is included

export default function SignupPage() {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "pharmacist",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast(); // ✅ correct usage

  const handleChange = (e: any) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/users/signup", formData);
      const data = res.data;
      setLoading(false);

      if (res.status === 200) {
        toast({
          title: "✅ Account Created",
          description: "Your account has been created successfully!",
        });

        // Delay redirect slightly so user can see toast
        setTimeout(() => router.push("/login"), 1500);
      } else {
        toast({
          variant: "destructive",
          title: "❌ Signup Failed",
          description: data.message || "Check your input.",
        });
      }
    } catch (err: any) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "⚠️ Error",
        description:
          err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      <Card className="w-full max-w-md p-8 shadow-lg rounded-2xl relative">
        <CardContent>
          <h1 className="text-3xl font-semibold text-center mb-6 text-blue-700">
            Create Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                type="text"
                name="userName"
                placeholder="Username"
                className="pl-10"
                value={formData.userName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                type="email"
                name="email"
                placeholder="Email"
                className="pl-10"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                className="pl-10"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                type="password"
                name="passwordConfirm"
                placeholder="Confirm Password"
                className="pl-10"
                value={formData.passwordConfirm}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative">
              <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2 pl-10 text-gray-700 focus:ring focus:ring-blue-200"
                required
              >
                <option value="admin">Admin</option>
                <option value="pharmacist">Pharmacist</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ✅ Toast renderer */}
      <Toaster />
    </div>
  );
}
