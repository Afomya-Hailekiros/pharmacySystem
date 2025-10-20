import axios from "axios";

const instance = axios.create({
  baseURL: "https://pharmacy-management-9ls6.onrender.com/api/v1",
  withCredentials: true, // ✅ automatically send & receive cookies
});

export default instance;
