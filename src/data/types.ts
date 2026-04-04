// ─── Utility Types ───────────────────────────────────────────────
// Derive union types from constant objects in constants.ts

import type {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  USER_ROLE,
  LANGUAGE,
  SERVICE_CATEGORY,
  APPOINTMENT_STATUS,
} from "./constants";

type ValueOf<T> = T[keyof T];

// ─── Enum Union Types ────────────────────────────────────────────
export type OrderStatus = ValueOf<typeof ORDER_STATUS>;
export type PaymentMethod = ValueOf<typeof PAYMENT_METHOD>;
export type PaymentStatus = ValueOf<typeof PAYMENT_STATUS>;
export type UserRole = ValueOf<typeof USER_ROLE>;
export type Language = ValueOf<typeof LANGUAGE>;
export type ServiceCategory = ValueOf<typeof SERVICE_CATEGORY>;
export type AppointmentStatus = ValueOf<typeof APPOINTMENT_STATUS>;

// ─── Domain Entities ─────────────────────────────────────────────
export type User = {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  language: Language;
  created_at: string;
};

export type Customer = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  notes: string;
  created_at: string;
};

export type Appointment = {
  id: string;
  customer_id: string;
  service_category: ServiceCategory;
  status: AppointmentStatus;
  date: string;
  time: string;
  notes: string;
  created_at: string;
};

export type Measurement = {
  id: string;
  customer_id: string;
  label: string;
  values: Record<string, number>;
  submitted_online: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  customer_id: string;
  appointment_id: string | null;
  service_category: ServiceCategory;
  status: OrderStatus;
  description: string;
  price: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  order_id: string;
  customer_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

// ─── Translation ─────────────────────────────────────────────────
export type TranslationKey = string;
export type TranslationSet = Record<TranslationKey, string>;
export type Translations = Record<Language, TranslationSet>;
