export type UserRole = 'PATIENT' | 'HEALTHCARE_PROFESSIONAL' | 'ORGANIZATION_LAB';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  facility?: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token?: string;
  isDemoUser: boolean;
}
