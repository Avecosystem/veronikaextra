
// types.ts

/**
 * Represents a user in the application.
 */
export interface User {
  id: number;
  name: string;
  email: string;
  credits: number;
  createdAt: string;
  token?: string; // JWT token, optional as it's not part of the core user data structure in DB
  isAdmin?: boolean; // Added isAdmin flag
  country: string; // Added country field, now mandatory
}

/**
 * Defines the structure for the authentication context.
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signup: (name: string, email: string, password: string, country: string) => Promise<boolean>;
  logout: () => void;
  updateUserCredits: (newCredits: number) => void;
  loading: boolean;
  error: string | null;
}

/**
 * Defines the structure for the theme context.
 */
export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

/**
 * Represents a generated image result.
 */
export interface ImageResult {
  id: string;
  url: string;
  prompt: string;
}

/**
 * Represents data for the demo gallery.
 */
export interface DemoImage {
  src: string;
  alt: string;
}

/**
 * Represents a manual payment request (e.g., UPI).
 */
export interface PaymentRequest {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  plan: string; // e.g., "50 Credits"
  credits: number; // Added explicit credits for robust handling
  amount: number; // e.g., 199
  utrCode: string;
  date: string; // YYYY-MM-DD
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

/**
 * Represents a crypto payment transaction (e.g., OXPAY).
 */
export interface CryptoPaymentTransaction {
  id: number; // Unique ID for this transaction
  userId: number;
  userName: string;
  userEmail: string;
  orderId: string; // OXPAY's order ID for tracking
  credits: number; // Credits purchased
  amount: number; // Amount paid in USD
  currency: 'USD'; // Always USD for OXPAY in this app
  gateway: 'OXPAY';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string; // When the payment was marked completed
}

/**
 * Represents a credit plan, now with an ID for dynamic management.
 */
export interface CreditPlan {
  id: number;
  credits: number;
  inrPrice: number;
  usdPrice: number;
}

/**
 * Represents dynamic contact information managed by admin.
 */
export interface ContactInfo {
  email1: string;
  email2: string;
  location: string;
  phone: string;
  note: string;
}

/**
 * Represents social media links managed by admin.
 */
export interface SocialLinks {
  instagram: string;
  twitter: string;
  website: string;
  general: string;
}

/**
 * Represents legal page content (Terms and Privacy).
 */
export interface LegalContent {
  terms: string;
  privacy: string;
}

/**
 * Represents the structure of an API response using a discriminated union.
 * When success is true, data and token are guaranteed to exist.
 * When success is false, only a message is provided.
 */
export type ApiResponse<T> =
  | { success: true; data: T; message?: string; token?: string; }
  | { success: false; message: string; };

/**
 * Represents a unified payment transaction for display in user's payment history.
 */
export interface UnifiedPaymentTransaction {
  type: 'upi' | 'crypto';
  id: number; // Original request/transaction ID
  userId: number;
  userName: string;
  userEmail: string;
  planOrCredits: string; // e.g., "50 Credits" or "50 Credits (Crypto)"
  amount: number;
  currency: 'INR' | 'USD';
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  // UPI specific
  utrCode?: string;
  paymentDate?: string; // Original date field from PaymentRequest
  note?: string;
  // Crypto specific
  orderId?: string; // OXPAY order ID
  gateway?: 'OXPAY';
  completedAt?: string; // When the crypto transaction was completed
}
