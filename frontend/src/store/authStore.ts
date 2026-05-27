import { create } from "zustand";

import {
  api,
  setAuthLoggingOut,
} from "../lib/axios";

import { authService } from "../services/authService";

import type {
  LoginFormValues,
  RegisterFormValues,
} from "../schemas/auth.schema";

type User = {
  _id?: string;
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  portfolio?: {
    title?: string;
    location?: string;
    website?: string;
    layout?: "showcase" | "grid" | "studio";
    theme?: "" | "aurora" | "gallery" | "noir" | "mint";
  };
  role: string;
  status?: string;
};

type AuthState = {
  user: User | null;

  token: string | null;

  isAuthenticated: boolean;

  isLoading: boolean;

  error: string | null;

  login: (
    data: LoginFormValues
  ) => Promise<void>;

  register: (
    data: RegisterFormValues
  ) => Promise<{
    success: boolean;
    message: string;
    email: string;
  }>;

  fetchCurrentUser: () => Promise<void>;

  logout: () => Promise<void>;
};

type ApiError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  request?: unknown;
  message?: string;
};

function getAuthErrorMessage(
  error: unknown,
  fallback: string
) {
  const apiError = error as ApiError;

  if (apiError.response?.data?.message) {
    return apiError.response.data.message;
  }

  if (apiError.request) {
    return "Cannot connect to backend API. Please check backend server and API URL.";
  }

  return apiError.message || fallback;
}

function normalizeUser(user: User): User {
  return {
    ...user,
    id: user.id || user._id || "",
  };
}

export const useAuthStore =
  create<AuthState>((set) => ({
    user: null,

    token:
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null,

    isAuthenticated:
      typeof window !== "undefined"
        ? !!localStorage.getItem("token")
        : false,

    isLoading: false,

    error: null,

    login: async (
      data: LoginFormValues
    ) => {
      try {
        set({
          isLoading: true,
          error: null,
        });

        const res =
          await authService.login(data);

        const accessToken =
          res.data.accessToken ||
          res.data.token;

        localStorage.setItem(
          "token",
          accessToken
        );

        localStorage.setItem(
          "username",
          res.data.user.username
        );

        set({
          user: normalizeUser(
            res.data.user
          ),

          token: accessToken,

          isAuthenticated: true,

          isLoading: false,
        });
      } catch (error: unknown) {
        console.log(error);
        const apiError = error as ApiError;

        set({
          error:
            apiError.response?.data?.message ||
            "Login failed",

          isLoading: false,
        });

        throw error;
      }
    },

    register: async (data) => {
      try {
        set({
          isLoading: true,
          error: null,
        });

        const res =
          await authService.register(
            {
              username:
                data.username.trim(),
              email:
                data.email.trim(),
              password:
                data.password,
            }
          );

        set({
          isLoading: false,
        });

        return res.data;
      } catch (error: unknown) {
        console.log(error);

        set({
          error: getAuthErrorMessage(
            error,
            "Register failed"
          ),

          isLoading: false,
        });

        throw error;
      }
    },
    fetchCurrentUser: async () => {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) return;

        const res =
          await authService.me();

        const currentToken =
          localStorage.getItem("token");

        if (!currentToken) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });

          return;
        }

        set({
          user: normalizeUser(
            res.data
          ),

          token: currentToken,

          isAuthenticated: true,
        });
      } catch {
        localStorage.removeItem("token");

        localStorage.removeItem(
          "username"
        );

        set({
          user: null,

          token: null,

          isAuthenticated: false,
        });
      }
    },
    logout: async () => {
      setAuthLoggingOut(true);
      localStorage.removeItem("token");
      localStorage.removeItem("username");

      set({
        user: null,

        token: null,

        isAuthenticated: false,

        isLoading: false,

        error: null,
      });

      try {
        await api.post(
          "/auth/logout",
          undefined,
          {
            _skipAuthRefresh: true,
          }
        );
      } catch {
        // Local logout is still valid even if the network request fails.
      } finally {
        setAuthLoggingOut(false);
      }
    },
  }));
