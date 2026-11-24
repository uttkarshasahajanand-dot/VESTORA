
import axios from "axios";

const API = axios.create({
  baseURL: "https://backend-olive-mu-39.vercel.app/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Automatically attach authentication token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
