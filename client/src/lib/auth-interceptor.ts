import { useMainStore } from "@/store";
import axios from "axios";
import config from "../../system.config.json";

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

export const baseURL = window.origin.includes("https://")
  ? config.tunneledServer
  : config.localServer;

export const axiosInstance = axios.create({
  baseURL,
});

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest?.url?.includes("/api/auth/refresh-token")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue request while refresh is happening
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // const query = `?jwt_rf=${localStorage.getItem(
        //   "jwt_rf"
        // )}&id=${localStorage.getItem("id")}`;

        const rs = await axios.get("/api/auth/refresh-token", {
          baseURL,
          withCredentials: true,
        });

        // if (!config.isProduction) {
        //   localStorage.setItem("jwt_rf", rs.data.refreshToken);
        // }

        const newToken = rs.data.accessToken;
        useMainStore.getState().setToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError: unknown) {
        processQueue(refreshError, null);

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
