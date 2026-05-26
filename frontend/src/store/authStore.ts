import { create } from "zustand";

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

  logout: () => void;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

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

        localStorage.setItem(
          "token",
          res.data.token
        );

        localStorage.setItem(
          "username",
          res.data.user.username
        );

        set({
          user: normalizeUser(
            res.data.user
          ),

          token: res.data.token,

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
            data
          );

        localStorage.setItem(
          "token",
          res.data.token
        );

        localStorage.setItem(
          "username",
          res.data.user.username
        );

        set({
          user: normalizeUser(
            res.data.user
          ),

          token: res.data.token,

          isAuthenticated: true,

          isLoading: false,
        });

        return res.data;
      } catch (error: unknown) {
        console.log(error);
        const apiError = error as ApiError;

        set({
          error:
            apiError.response?.data?.message ||
            "Register failed",

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

        set({
          user: normalizeUser(
            res.data
          ),

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
    logout: () => {
      localStorage.removeItem("token");

      localStorage.removeItem("username");
      set({
        user: null,

        token: null,

        isAuthenticated: false,

        isLoading: false,

        error: null,
      });
    },
  }));
