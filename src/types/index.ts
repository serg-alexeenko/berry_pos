/**
 * @file: index.ts
 * @description: Основні типи для системи без tenant
 * @created: 2024-12-19
 */

// Типи користувачів
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

// Типи підприємств
export interface Business {
  id: string;
  user_id: string;
  name: string;
  type: 'restaurant' | 'cafe' | 'shop' | 'bar' | 'other';
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  primary_color: string;
  secondary_color: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  stats?: BusinessStats;
}

export interface BusinessStats {
  products_count: number;
  orders_today: number;
}

// Типи категорій
export interface Category {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Типи продуктів
export interface Product {
  id: string;
  business_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  sku?: string;
  barcode?: string;
  stock_quantity: number;
  min_stock_level: number;
  unit: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

// Типи працівників
export interface Employee {
  id: string;
  business_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role: 'owner' | 'manager' | 'employee' | 'cashier';
  hourly_rate?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

// Типи клієнтів
export interface Customer {
  id: string;
  business_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyalty_points: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Типи замовлень
export interface Order {
  id: string;
  business_id: string;
  customer_id?: string;
  employee_id?: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  payment_method: 'cash' | 'card' | 'online' | 'other';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  employee?: Employee;
  items?: OrderItem[];
}

// Типи елементів замовлення
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  created_at: string;
  product?: Product;
}

// Типи для API відповідей
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  details?: string;
}

// Типи для аутентифікації
export interface AuthData {
  user: User;
  businesses: Business[];
  session: any;
}

// Типи для форм
export interface BusinessFormData {
  name: string;
  type: Business['type'];
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  primary_color: string;
  secondary_color: string;
}

export interface ProductFormData {
  name: string;
  category_id?: string;
  description?: string;
  price: number;
  cost: number;
  sku?: string;
  barcode?: string;
  stock_quantity: number;
  min_stock_level: number;
  unit: string;
}

export interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role: Employee['role'];
  hourly_rate?: number;
}

export interface CustomerFormData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

// Типи для фільтрації та пошуку
export interface FilterOptions {
  search?: string;
  category_id?: string;
  is_active?: boolean;
  min_price?: number;
  max_price?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Типи для статистики
export interface DashboardStats {
  total_products: number;
  total_orders: number;
  total_customers: number;
  total_revenue: number;
  orders_today: number;
  revenue_today: number;
}

export interface BusinessStats {
  products_count: number;
  orders_today: number;
  revenue_today: number;
  active_employees: number;
}
