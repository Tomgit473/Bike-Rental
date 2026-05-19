import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../services/api.js";

const initialState = {
  items: [],
  current: null,
  checkout: null,
  status: "idle",
  error: null
};

export const createBooking = createAsyncThunk("bookings/create", async (payload) => {
  const { data } = await api.post("/bookings", payload);
  return data;
});

export const fetchBookings = createAsyncThunk("bookings/fetch", async (params = {}) => {
  const { data } = await api.get("/bookings", { params });
  return data;
});

export const createCheckout = createAsyncThunk("bookings/checkout", async (payload) => {
  const { data } = await api.post("/payments/checkout", payload);
  return data;
});

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload.booking;
        state.items.unshift(action.payload.booking);
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.items = action.payload.bookings || [];
      })
      .addCase(createCheckout.fulfilled, (state, action) => {
        state.checkout = action.payload;
      })
      .addMatcher(
        (action) => ["bookings/create/rejected", "bookings/fetch/rejected", "bookings/checkout/rejected"].includes(action.type),
        (state, action) => {
          state.status = "failed";
          state.error = action.error.message;
        }
      );
  }
});

export default bookingSlice.reducer;
