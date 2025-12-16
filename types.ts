export enum UserRole {
  GUEST = 'guest',
  TRAVELER = 'traveler',
  MERCHANT = 'merchant',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  token?: string;
  status: 'active' | 'pending' | 'rejected'; // Account status
  qualificationUrl?: string; // For merchants
}

export interface Attraction {
  id: string;
  title: string;
  description: string;
  address: string;
  region: string; // Keep for display formatted string
  province?: string;
  city?: string;
  county?: string;
  tags: string[];
  imageUrl: string;
  gallery?: string[]; // Additional photos
  openHours?: string;
  drivingTips?: string;
}

export interface Post {
  id: string;
  attractionId: string;
  userId: string;
  username: string;
  content: string;
  rating?: number; // 1-5 star rating
  imageUrl?: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
  status: 'active' | 'reported' | 'hidden';
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

export interface Product {
  id: string;
  merchantId: string;
  merchantName: string;
  attractionId?: string; // Associated map location/attraction
  attractionName?: string; // Denormalized for display
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}