import axios from "axios";
import { handleDemoRequest } from "./demoApi.js";

export const API_URL = import.meta.env.VITE_API_URL || "/api";

const http = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

let backendMode = "live";

export const shouldPreferDemoBackend = () => {
  if (import.meta.env.VITE_FORCE_DEMO === "true") return true;
  if (typeof window === "undefined") return false;

  const { hostname, protocol } = window.location;
  if (protocol === "file:") return true;

  return API_URL === "/api" && !["localhost", "127.0.0.1"].includes(hostname);
};

backendMode = shouldPreferDemoBackend() ? "demo" : "live";

export const isDemoBackendActive = () => backendMode === "demo";

const toUserError = (error) => {
  if (error instanceof Error && !error.response) {
    return error;
  }

  const message = error.response?.data?.message || error.message || "Request failed";
  return new Error(message);
};

const shouldFallbackToDemo = (error) => {
  if (backendMode === "demo") return true;
  if (shouldPreferDemoBackend()) return true;
  if (!error.response) return true;
  if (API_URL === "/api" && [404, 405, 500, 502, 503].includes(error.response.status)) return true;
  return false;
};

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("rideLoopToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const buildHeaders = (headers = {}) => {
  const token = localStorage.getItem("rideLoopToken");
  return token
    ? {
        ...headers,
        Authorization: `Bearer ${token}`
      }
    : headers;
};

const request = async (method, url, config = {}) => {
  const requestConfig = {
    method,
    url,
    ...config,
    headers: buildHeaders(config.headers)
  };

  if (backendMode === "demo") {
    return {
      data: await handleDemoRequest({
        method,
        url,
        data: config.data,
        params: config.params,
        headers: requestConfig.headers
      })
    };
  }

  try {
    const response = await http(requestConfig);
    backendMode = "live";
    return response;
  } catch (error) {
    if (shouldFallbackToDemo(error)) {
      backendMode = "demo";
      return {
        data: await handleDemoRequest({
          method,
          url,
          data: config.data,
          params: config.params,
          headers: requestConfig.headers
        })
      };
    }

    return Promise.reject(toUserError(error));
  }
};

export const api = {
  get(url, config = {}) {
    return request("GET", url, config);
  },
  post(url, data = {}, config = {}) {
    return request("POST", url, { ...config, data });
  },
  patch(url, data = {}, config = {}) {
    return request("PATCH", url, { ...config, data });
  },
  delete(url, config = {}) {
    return request("DELETE", url, config);
  }
};
