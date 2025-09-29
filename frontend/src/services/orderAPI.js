// services/orderAPI.js
import axios from "axios";

const API_URL = "https://online-pharmacy-1.onrender.com/api/orders";

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

const orderAPI = {
  createOrder: (orderData) => api.post("/", orderData),
  getUserOrders: () => api.get("/"),
  getOrderById: (orderId) => api.get(`/${orderId}`),
  getAllOrders: (queryParams = {}) => {
    const params = new URLSearchParams();
    if (queryParams.status) params.append("status", queryParams.status);
    if (queryParams.page) params.append("page", queryParams.page);
    if (queryParams.limit) params.append("limit", queryParams.limit);

    const queryString = params.toString();
    return api.get(`/all?${queryString}`);
  },
  updateOrderStatus: (orderId, statusData) =>
    api.put(`/${orderId}`, statusData),
  cancelOrder: (orderId) => api.patch(`/${orderId}`),
};

export default orderAPI;
