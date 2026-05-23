
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

  me: async () => api.get("/auth/me"),
};