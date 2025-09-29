// services/cartAPI.js
import axios from "axios";

const API_URL = "https://online-pharmacy-1.onrender.com/api/cart";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const cartAPI = {
  getCart: () => api.get("/"),
  addToCart: (medicineId, quantity) => api.post("/", { medicineId, quantity }),
  updateCartItem: (itemId, quantity) => api.put(`/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/${itemId}`),
  clearCart: () => api.delete("/"),
};

export default cartAPI;
