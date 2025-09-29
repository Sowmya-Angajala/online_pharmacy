// import { configureStore } from '@reduxjs/toolkit'
// import authReducer from './slices/authSlice'
// import prescriptionReducer from './slices/prescriptionSlice'; // Add this import

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//   },
// })

// store/store.js or store/index.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import prescriptionReducer from "./slices/prescriptionSlice";
import cartReducer from "./slices/cartSlice"; // Add this import
import orderReducer from "./slices/orderSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    prescription: prescriptionReducer,
    cart: cartReducer,
    orders: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"], // If using redux-persist
      },
    }),
});

export default store;
