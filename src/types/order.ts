export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderItem = {
  id: number;
  product_id: number;
  product_name?: string;
  product_name_en?: string | null;
  product_price?: number;
  quantity: number;
  subtotal: number;
};

export type PaymentMethod = "cash_on_delivery" | "online" | null;

export type OrderUser = {
  id: number;
  name: string;
};

export type OrderCoupon = {
  id: number;
  code?: string;
};

export type Order = {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  subtotal: number;
  discount: number;
  shipping_cost?: number;
  total: number;
  notes?: string | null;
  shipping_name?: string;
  shipping_phone?: string;
  shipping_email?: string | null;
  shipping_address?: string;
  shipping_city?: string;
  items: OrderItem[];
  coupon?: OrderCoupon | null;
  user?: OrderUser;
  created_at: string;
  updated_at?: string;
};

export type PaymentGateway = "stripe" | "paypal" | "cod";

export type PaymentStatusPayload = {
  order_number: string;
  payment_method: string | null;
  payment_status: PaymentStatus;
  payment: {
    transaction_id: string;
    gateway: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
  } | null;
};
