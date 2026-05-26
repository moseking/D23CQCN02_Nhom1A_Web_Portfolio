
import { api } from "../lib/axios";
import type {
  LoginFormValues,
  RegisterFormValues,
} from "../schemas/auth.schema";

export const authService = {
  login: async (data: LoginFormValues) =>
    api.post("/auth/login", data),

  register: async (data: RegisterFormValues) =>
    api.post("/auth/register", data),

  verifyEmail: async (
    data: {
      email: string;
      otp: string;
    }
  ) => api.post("/auth/verify-email", data),

  resendOtp: async (
    data: {
      email: string;
    }
  ) => api.post("/auth/resend-otp", data),

  forgotPassword: async (
    data: {
      email: string;
    }
  ) =>
    api.post(
      "/auth/forgot-password",
      data
    ),

  resetPassword: async (
    data: {
      email: string;
      otp: string;
      password: string;
    }
  ) =>
    api.post(
      "/auth/reset-password",
      data
    ),

  me: async () => api.get("/auth/me"),
};
