import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../services/api.js";

const initialState = {
  user: JSON.parse(localStorage.getItem("rideLoopUser") || "null"),
  token: localStorage.getItem("rideLoopToken"),
  status: "idle",
  error: null
};

export const login = createAsyncThunk("auth/login", async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
});

export const register = createAsyncThunk("auth/register", async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
});

export const loadMe = createAsyncThunk("auth/me", async () => {
  const { data } = await api.get("/auth/me");
  return data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("rideLoopToken");
      localStorage.removeItem("rideLoopUser");
    },
    setOAuthSession(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem("rideLoopToken", action.payload.token);
      localStorage.setItem("rideLoopUser", JSON.stringify(action.payload.user));
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => ["auth/login/pending", "auth/register/pending", "auth/me/pending"].includes(action.type),
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )
      .addMatcher(
        (action) => ["auth/login/fulfilled", "auth/register/fulfilled"].includes(action.type),
        (state, action) => {
          state.status = "succeeded";
          state.token = action.payload.token;
          state.user = action.payload.user;
          localStorage.setItem("rideLoopToken", action.payload.token);
          localStorage.setItem("rideLoopUser", JSON.stringify(action.payload.user));
        }
      )
      .addCase(loadMe.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        localStorage.setItem("rideLoopUser", JSON.stringify(action.payload.user));
      })
      .addMatcher(
        (action) => ["auth/login/rejected", "auth/register/rejected", "auth/me/rejected"].includes(action.type),
        (state, action) => {
          state.status = "failed";
          state.error = action.error.message;
        }
      );
  }
});

export const { logout, setOAuthSession } = authSlice.actions;
export default authSlice.reducer;
