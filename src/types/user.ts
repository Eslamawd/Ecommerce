export type UserRole = "customer" | "vendor" | "admin";

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  email_verified_at?: string | null;
  is_email_verified?: boolean;
  roles: UserRole[];
  created_at: string;
};

export type AuthPayload = {
  user: User;
  token: string;
};
