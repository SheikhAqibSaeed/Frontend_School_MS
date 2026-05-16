export type UserRole =
  | 'SUPER_ADMIN'
  | 'PRINCIPAL'
  | 'TEACHER'
  | 'STUDENT'
  | 'ACCOUNTANT'
  | 'LIBRARIAN'
  | 'TRANSPORT_MANAGER';

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isSuperAdmin: boolean;
  schoolId: string | null;
  roles?: string[];
  /** Effective permission codes for the active school (from login). Super admin: `['*']`. */
  permissions?: string[];
};

export type LoginPayload = {
  email: string;
  password: string;
  schoolId?: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: AuthUser;
};

export type RegisterSchoolOption = {
  id: string;
  name: string;
  slug: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  schoolId: string;
  role: string;
};
