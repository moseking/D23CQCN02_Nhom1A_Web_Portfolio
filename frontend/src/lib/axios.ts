import axios from "axios";
import type {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    _skipAuthRefresh?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _skipAuthRefresh?: boolean;
  }
}

type RetryRequestConfig =
  InternalAxiosRequestConfig & {
    _retry?: boolean;
    _skipAuthRefresh?: boolean;
  };

let isLoggingOut = false;

export const setAuthLoggingOut = (
  value: boolean
) => {
  isLoggingOut = value;
};

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryRequestConfig;
    const hasToken =
      typeof window !== "undefined"
        ? Boolean(localStorage.getItem("token"))
        : false;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest._skipAuthRefresh &&
      !isLoggingOut &&
      hasToken &&
      !originalRequest.url?.includes(
        "/auth/refresh-token"
      ) &&
      !originalRequest.url?.includes(
        "/auth/login"
      ) &&
      !originalRequest.url?.includes(
        "/auth/logout"
      )
    ) {
      originalRequest._retry = true;

      try {
        const res = await api.post(
          "/auth/refresh-token"
        );

        const accessToken =
          res.data.accessToken ||
          res.data.token;

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "token",
            accessToken
          );
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          window.location.href = "/";
        }

        return Promise.reject(
          refreshError
        );
      }
    }

    return Promise.reject(error);
  }
);
