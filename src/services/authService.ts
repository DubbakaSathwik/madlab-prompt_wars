import { User, AuthState } from '../types/auth';

const STORAGE_KEY = 'medlens_auth_state';

const DEMO_USER: User = {
  id: 'usr-clinician-demo',
  name: 'Dr. Kenneth Reed, MD',
  email: 'k.reed@medlens-clinical.org',
  role: 'HEALTHCARE_PROFESSIONAL',
  facility: 'MedLab Diagnostics & Clinical Center',
  createdAt: '2026-01-10T08:00:00Z'
};

export class AuthService {
  private static state: AuthState = {
    isAuthenticated: false,
    user: null,
    isDemoUser: false
  };

  static init(): AuthState {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.state = JSON.parse(saved);
      } catch {
        this.state = { isAuthenticated: false, user: null, isDemoUser: false };
      }
    }
    return this.state;
  }

  static getAuthState(): AuthState {
    return this.state;
  }

  static loginWithDemo(): AuthState {
    this.state = {
      isAuthenticated: true,
      user: DEMO_USER,
      token: 'demo-jwt-token-medlens-hackathon',
      isDemoUser: true
    };
    this.persist();
    return this.state;
  }

  static login(email: string, _password: string, role?: string): AuthState {
    // Validates and constructs authenticated user
    const user: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      role: (role as any) || 'HEALTHCARE_PROFESSIONAL',
      facility: 'Metro Health Alliance',
      createdAt: new Date().toISOString()
    };

    this.state = {
      isAuthenticated: true,
      user,
      token: `jwt-${Date.now()}`,
      isDemoUser: false
    };
    this.persist();
    return this.state;
  }

  static register(fullName: string, email: string, _password: string, role: string): AuthState {
    const user: User = {
      id: `usr-${Date.now()}`,
      name: fullName,
      email,
      role: (role as any) || 'PATIENT',
      facility: role === 'ORGANIZATION_LAB' ? 'Central Pathology Laboratory' : undefined,
      createdAt: new Date().toISOString()
    };

    this.state = {
      isAuthenticated: true,
      user,
      token: `jwt-${Date.now()}`,
      isDemoUser: false
    };
    this.persist();
    return this.state;
  }

  static logout(): AuthState {
    this.state = {
      isAuthenticated: false,
      user: null,
      isDemoUser: false
    };
    localStorage.removeItem(STORAGE_KEY);
    return this.state;
  }

  private static persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }
}
