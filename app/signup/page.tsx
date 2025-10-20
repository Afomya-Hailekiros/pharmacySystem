"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function useToast() {
  return {
    toast: (opts: { title?: string; description?: string; variant?: string }) => {
      const message = `${opts.title || ""}${opts.description ? " - " + opts.description : ""}`;
      // simple fallback toast for environments without the UI toast hook
      // eslint-disable-next-line no-alert
      alert(message);
    },
  };
}

import { User, Mail, Lock, Shield } from "lucide-react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "pharmacist", // default role
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        "https://pharmacy-management-9ls6.onrender.com/api/v1/users/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        console.log("Logged in user:", data.token);
        console.log("Login response data:", data);

        localStorage.setItem("token", data.token);
        toast({
          title: "✅ Account Created",
          description: "Your account has been created successfully!",
        });
        router.push("/login");
      } else {
        toast({
          variant: "destructive",
          title: "❌ Signup Failed",
          description: data.message || "Please check your input.",
        });
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "⚠️ Error",
        description: "Something went wrong. Try again.",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      <Card className="w-full max-w-md p-8 shadow-lg rounded-2xl">
        <CardContent>
          <h1 className="text-3xl font-semibold text-center mb-6 text-blue-700">
            Create Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
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

            {/* Email */}
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

            {/* Password */}
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

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <Input
                type="password"
                name="passwordConfirm"
                placeholder="Confirm password"
                className="pl-10"
                value={formData.passwordConfirm}
                onChange={handleChange}
                required
              />
            </div>

            {/* Role */}
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

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 font-medium hover:underline">
              Login here
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
