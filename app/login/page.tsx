"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/users/login", formData, { withCredentials: true });
      const data = res.data;
      setLoading(false);

      if (data.status === "success" && data.data?.user) {
        const user = data.data.user;
        const role = user.role?.trim().toLowerCase();

        // Store non-sensitive data
        document.cookie = `role=${role}; path=/; max-age=3600; SameSite=Lax`;
        document.cookie = `jwt=${data.token}; path=/; max-age=86400; SameSite=Lax`;

        toast({
          title: "✅ Login Successful",
          description: `Welcome back, ${user.userName || "User"}!`,
          variant: "success",
        });

        const redirectTo =
          new URLSearchParams(window.location.search).get("redirect") ||
          (role === "admin"
            ? "/dashboard/admin"
            : role === "pharmacist"
            ? "/dashboard/pharmacist"
            : "/unauthorized");

        setTimeout(() => (window.location.href = redirectTo), 1200);
      } else {
        toast({
          title: "❌ Login Failed",
          description: data.message || "Invalid email or password.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setLoading(false);
      toast({
        title: "⚠️ Error",
        description: "Something went wrong. Try again.",
        variant: "destructive",
      });
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      <Card className="w-full max-w-md p-8 shadow-lg rounded-2xl relative">
        <CardContent>
          <h1 className="text-3xl font-semibold text-center mb-6 text-blue-700">
            Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
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

            {/* Password Input with Eye Toggle */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="pl-10 pr-10"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>

        {/* Toast container */}
        <Toaster />
      </Card>
    </div>
  );
}
