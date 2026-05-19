import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import bookingReducer from "./bookingSlice.js";
import vehicleReducer from "./vehicleSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vehicles: vehicleReducer,
    bookings: bookingReducer
  }
});
