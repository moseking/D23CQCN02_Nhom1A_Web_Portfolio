import { create } from "zustand";

import { authService } from "../services/authService";

import type {
  LoginFormValues,
  RegisterFormValues,
} from "../schemas/auth.schema";

type User = {
  id: string;
  username: string;
  email: string;
  role: string;
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
  ) => Promise<void>;

  fetchCurrentUser: () => Promise<void>;

  logout: () => void;
};

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
          user: res.data.user,

          token: res.data.token,

          isAuthenticated: true,

          isLoading: false,
        });
      } catch (error: any) {
        console.log(error);

        set({
          error:
            error.response?.data?.message ||
            "Login failed",

          isLoading: false,
        });

        throw error;
      }
    },

    register: async (
      data: RegisterFormValues
    ) => {
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
          user: res.data.user,

          token: res.data.token,

          isAuthenticated: true,

          isLoading: false,
        });
      } catch (error: any) {
        console.log(error);

        set({
          error:
            error.response?.data?.message ||
            "Register failed",

          isLoading: false,
        });
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
          user: res.data,

          isAuthenticated: true,
        });
      } catch (error) {
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