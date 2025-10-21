// lib/axios.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://pharmacy-management-9ls6.onrender.com/api/v1", // ✅ full URL
  withCredentials: true, // ✅ include cookies
});

export default axiosInstance;
