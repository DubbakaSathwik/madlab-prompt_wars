import { User, AuthState } from '../types/auth';

const STORAGE_KEY = 'medlens_auth_state';
const USERS_STORAGE_KEY = 'medlens_registered_users';

interface StoredUserAccount {
  user: User;
  passwordHash: string;
}

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

  static login(email: string, password?: string, role?: string): AuthState {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      throw new Error('Please provide a valid email address.');
    }

    // Check against registered accounts
    const registered = this.getRegisteredUsers();
    const existing = registered.find(u => u.user.email.toLowerCase() === cleanEmail);

    if (existing) {
      if (password && existing.passwordHash !== password) {
        throw new Error('Invalid email or password.');
      }
      this.state = {
        isAuthenticated: true,
        user: existing.user,
        token: `jwt-${Date.now()}`,
        isDemoUser: false
      };
      this.persist();
      return this.state;
    }

    // Direct login creation for demo flexibility
    const user: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email: cleanEmail,
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

  static register(fullName: string, email: string, password?: string, role?: string): AuthState {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (fullName || '').trim();

    if (!cleanName) {
      throw new Error('Please enter your full name.');
    }

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Please provide a valid clinical or personal email address.');
    }

    if (password && password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const registered = this.getRegisteredUsers();
    if (registered.some(u => u.user.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const user: User = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: (role as any) || 'PATIENT',
      facility: role === 'ORGANIZATION_LAB' ? 'Central Pathology Laboratory' : undefined,
      createdAt: new Date().toISOString()
    };

    registered.push({
      user,
      passwordHash: password || 'default'
    });
    this.saveRegisteredUsers(registered);

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

  private static getRegisteredUsers(): StoredUserAccount[] {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private static saveRegisteredUsers(users: StoredUserAccount[]): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  private static persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }
}
