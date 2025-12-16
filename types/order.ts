// ============================
// 📌 ORDER TYPES - النظام الجديد
// ============================

import { Address, Product, ProductVariant, User } from "@prisma/client";

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  totalAmount: number;
  finalAmount: number;
  status: OrderStatus;

  assignedAdminId?: string;
  lastUpdatedBy?: string;
  statusHistory: string[];

  // معلومات الشحن
  shippingAddressId?: string;
  customerPhone?: string;
  customerName?: string;
  shippingAddress?: string;
  shippingCity?: string;

  // معلومات الدفع
  paymentMethod?: string;
  paymentStatus: string;
  notes?: string;

  // التواريخ
  createdAt: string;
  updatedAt: string;

  // العلاقات
  user?: User;
  assignedAdmin?: User;
  orderItems: OrderItem[];
  shippingAddressRef?: Address;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  discountAmount?: number;

  productName: string;
  variantDetails?: string;

  createdAt: string;

  // العلاقات
  product?: Product;
  variant?: ProductVariant;
}

export interface CreateOrderInput {
  userId: string;
  shippingAddressId: string;
  paymentMethod: string;

  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    originalPrice?: number;
    productName: string;
    variantDetails?: string;
  }[];

  // معلومات الشحن
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  assignedAdminId?: string;
  lastUpdatedBy?: string;
  paymentStatus?: string;
  notes?: string;
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}
