export interface MenuItem {
  name: string;
  description: string;
  price: string;
  tags?: string[]; // e.g. "Spicy", "GF", "Vegan"
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface MenuData {
  restaurantName: string;
  description?: string;
  categories: MenuCategory[];
}

export type AppStep = 'upload' | 'processing' | 'editor' | 'preview' | 'share';

export interface UploadedImage {
  id: string;
  url: string;
  base64: string; // Pure base64 data without prefix for API
  mimeType: string;
}
