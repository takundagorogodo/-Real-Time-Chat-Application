import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 5000
});

// Attach token from sessionStorage to every request
instance.interceptors.request.use(config => {
  const token = sessionStorage.getItem("token"); // Changed from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.log("Token expired - logging out");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default instance;