export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  contact_no?: string;
  role: string;
  restaurantId?: number;
}

export interface RestaurantAdmin extends User {
  fullName: string;
  phone: string;
  restaurantName: string;
  address?: string;
  city?: string;
}