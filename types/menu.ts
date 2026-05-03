export interface MenuItem {
  id: number;
  name: string;
  price: string;
  category: number;
  category_name?: string;
  status: boolean;
  image?: string;
}

export interface Category {
  id: number;
  name: string;
  status: boolean; }