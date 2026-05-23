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

  logout: () => void;
};

export const useAuthStore =
  create<AuthState>((set) => ({
    user: null,

    token:
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null,

    isAuthenticated: false,

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

        set({
          user: res.data.user,

          token: res.data.token,

          isAuthenticated: true,

          isLoading: false,
        });
      } catch (error) {
        set({
          error: "Login failed",

          isLoading: false,
        });
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

        set({
          user: res.data.user,

          token: res.data.token,

          isAuthenticated: true,

          isLoading: false,
        });
      } catch (error) {
        set({
          error: "Register failed",

          isLoading: false,
        });
      }
    },

    logout: () => {
      localStorage.removeItem("token");

      set({
        user: null,

        token: null,

        isAuthenticated: false,

        isLoading: false,

        error: null,
      });
    },
  }));