import { apiFetch } from "./api";

export const getMe = async () => {
  return apiFetch("/api/v1/user/me/");
};