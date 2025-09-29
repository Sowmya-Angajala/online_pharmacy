import axios from "axios";

const API_URL = "https://online-pharmacy-1.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
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

export const authAPI = {
  login: (userData) => api.post("/auth/login", userData),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
};

export const medicinesAPI = {
  fetchMedicines: () => api.get("/medicines"),
};

export default api;
