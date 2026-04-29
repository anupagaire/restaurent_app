import { apiFetch } from "./api";

// CATEGORY
export const getCategories = (restaurantId: number) =>
  apiFetch(`/api/v1/category/?restaurant=${restaurantId}`);

export const createCategory = (data: {
  restaurant: number;
  name: string;
  status?: boolean;
}) =>
  apiFetch(`/api/v1/category/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

// MENU
export const getMenus = (restaurantId: number) =>
  apiFetch(`/api/v1/menu/?restaurant=${restaurantId}`);

export const createMenu = (data: any) =>
  apiFetch(`/api/v1/menu/`, {
    method: "POST",
    body: JSON.stringify(data),
  });