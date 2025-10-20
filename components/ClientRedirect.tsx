"use client";

import { useEffect } from "react";

export default function ClientRedirect() {
  useEffect(() => {
    const role = document.cookie
      .split("; ")
      .find((row) => row.startsWith("role="))
      ?.split("=")[1];

    const path = window.location.pathname;

    // Redirect logged-in users away from /login and /signup
    if ((path === "/login" || path === "/signup") && role) {
      if (role === "admin") window.location.href = "/dashboard/admin";
      else if (role === "pharmacist") window.location.href = "/dashboard/pharmacist";
    }
  }, []);

  return null;
}
