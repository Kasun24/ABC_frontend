import appConfigs from "@/app/appConfigurations";
import type { AxiosInstance } from "axios";
import axios from "axios";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: appConfigs.apiUrl,
});

// Add a request interceptor to include the language and branch in each request
axiosInstance.interceptors.request.use(
  (config) => {
    const language = localStorage.getItem("selectedLanguage") || "en";
    const branch = localStorage.getItem("selectedBranchID");
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers["Language"] = language;
    config.headers["Branch"] = branch;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401) {
      // Handle token expiration
      localStorage.removeItem("access_token");
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
