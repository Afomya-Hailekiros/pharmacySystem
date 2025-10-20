"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios"; // our axios instance
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock } from "lucide-react";

function useToast() {
  return {
    toast: (opts: { title?: string; description?: string; variant?: string }) => {
      const message = `${opts.title || ""}${opts.description ? " - " + opts.description : ""}`;
      alert(message);
    },
  };
}

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/users/login", formData); // ✅ axios sends cookies automatically
      const data = res.data;
      setLoading(false);

      if (data.status === "success" && data.data?.user) {
        const user = data.data.user;
        const role = user.role.trim().toLowerCase();

        // ✅ Store role cookie for middleware
        document.cookie = `role=${role}; path=/; max-age=3600; SameSite=Lax`;

        toast({
          title: "✅ Login Successful",
          description: `Welcome back, ${user.userName || "User"}!`,
        });

        // ✅ Redirect based on role
        setTimeout(() => {
          if (role === "admin") router.push("/dashboard/admin");
          else if (role === "pharmacist") router.push("/dashboard/pharmacist");
          else router.push("/unauthorized");
        }, 400);
      } else {
        toast({
          variant: "destructive",
          title: "❌ Login Failed",
          description: data.message || "Invalid email or password.",
        });
      }
    } catch (err: any) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "⚠️ Error",
        description: "Something went wrong. Try again.",
      });
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      <Card className="w-full max-w-md p-8 shadow-lg rounded-2xl">
        <CardContent>
          <h1 className="text-3xl font-semibold text-center mb-6 text-blue-700">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                type="email"
                name="email"
                placeholder="Email address"
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

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
