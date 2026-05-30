import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../services/api.js";

const initialState = {
  items: [],
  selected: null,
  status: "idle",
  error: null,
  pagination: null
};

export const fetchVehicles = createAsyncThunk("vehicles/fetch", async (params = {}) => {
  const { data } = await api.get("/vehicles", { params });
  return data;
});

export const fetchVehicle = createAsyncThunk("vehicles/fetchOne", async (id) => {
  const { data } = await api.get(`/vehicles/${id}`);
  return data;
});

const vehicleSlice = createSlice({
  name: "vehicles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.vehicles || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.items = [];
      })
      .addCase(fetchVehicle.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchVehicle.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selected = action.payload.vehicle;
      })
      .addCase(fetchVehicle.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.selected = null;
      });
  }
});

export default vehicleSlice.reducer;
