import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BACKEND_URL = "https://pharmacy-management-9ls6.onrender.com/api/v1/users";

export async function GET(req: NextRequest) {
  try {
    // Forward cookies from client request (HttpOnly JWT)
    const cookieHeader = req.headers.get("cookie") || "";

    const res = await axios.get(BACKEND_URL, {
      headers: { cookie: cookieHeader },
      validateStatus: () => true, // don’t throw for 401/403
    });

    // Check if backend returned HTML (like login page)
    if (typeof res.data === "string" && res.data.startsWith("<!DOCTYPE")) {
      return NextResponse.json(
        { message: "Backend returned HTML instead of JSON" },
        { status: 500 }
      );
    }

    return NextResponse.json(res.data, { status: res.status });
  } catch (err: any) {
    console.error("Proxy error:", err.message);
    return NextResponse.json(
      { message: "Failed to fetch users", error: err.message },
      { status: 500 }
    );
  }
}
