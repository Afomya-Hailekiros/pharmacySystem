import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch("https://pharmacy-management-9ls6.onrender.com/api/v1/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok || !data.token) {
      return NextResponse.json({ success: false, message: data.message || "Invalid credentials" }, { status: res.status || 400 });
    }

    const role = data.data?.user?.role?.toLowerCase() || "";

    const response = NextResponse.json({ success: true, message: "Login successful", data });

    response.cookies.set("token", data.token, { httpOnly: true, secure: false, path: "/", maxAge: 3600 });
    response.cookies.set("role", role, { httpOnly: true, secure: false, path: "/", maxAge: 3600 });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
