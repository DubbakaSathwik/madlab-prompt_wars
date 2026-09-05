import '../../testSetup';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../authService';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    AuthService.logout();
  });

  it('initializes with unauthenticated default state when storage is empty (TC-AUTH-001/010)', () => {
    const state = AuthService.init();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.isDemoUser).toBe(false);
  });

  it('recovers gracefully from corrupted localStorage json', () => {
    localStorage.setItem('medlens_auth_state', 'invalid-non-json{');
    const state = AuthService.init();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('authenticates demo user correctly (TC-AUTH-006)', () => {
    const state = AuthService.loginWithDemo();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isDemoUser).toBe(true);
    expect(state.user?.name).toBe('Dr. Kenneth Reed, MD');
    expect(state.user?.role).toBe('HEALTHCARE_PROFESSIONAL');
    expect(state.token).toBeDefined();

    // Verify localStorage persistence (TC-AUTH-011)
    const saved = JSON.parse(localStorage.getItem('medlens_auth_state') || '{}');
    expect(saved.isAuthenticated).toBe(true);
    expect(saved.user?.email).toBe('k.reed@medlens-clinical.org');
  });

  it('authenticates custom user credentials and extracts display name', () => {
    const state = AuthService.login('clara.oswald@hospital.org', 'securePass123', 'HEALTHCARE_PROFESSIONAL');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isDemoUser).toBe(false);
    expect(state.user?.email).toBe('clara.oswald@hospital.org');
    expect(state.user?.name).toBe('Clara Oswald');
    expect(state.user?.role).toBe('HEALTHCARE_PROFESSIONAL');
    expect(state.token).toMatch(/^jwt-/);
  });

  it('registers new patient user correctly (TC-AUTH-001)', () => {
    const state = AuthService.register('John Watson', 'watson@bakerst.co.uk', 'secret', 'PATIENT');
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe('John Watson');
    expect(state.user?.email).toBe('watson@bakerst.co.uk');
    expect(state.user?.role).toBe('PATIENT');
    expect(state.user?.facility).toBeUndefined();
  });

  it('registers laboratory organization with standard facility name', () => {
    const state = AuthService.register('Central Diagnostics Staff', 'lab@centralpath.org', 'secret', 'ORGANIZATION_LAB');
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.role).toBe('ORGANIZATION_LAB');
    expect(state.user?.facility).toBe('Central Pathology Laboratory');
  });

  it('rejects registration with duplicate email address (TC-AUTH-002)', () => {
    AuthService.register('Alice', 'alice@test.com', 'secret123', 'PATIENT');
    expect(() => {
      AuthService.register('Alice Duplicate', 'alice@test.com', 'secret456', 'PATIENT');
    }).toThrow('already exists');
  });

  it('rejects registration with invalid email format (TC-AUTH-003)', () => {
    expect(() => {
      AuthService.register('Bob', 'not-an-email', 'secret123', 'PATIENT');
    }).toThrow('valid clinical or personal email');
  });

  it('rejects registration with weak password under 6 characters (TC-AUTH-004)', () => {
    expect(() => {
      AuthService.register('Charlie', 'charlie@test.com', '123', 'PATIENT');
    }).toThrow('at least 6 characters');
  });

  it('rejects login with wrong password for registered account (TC-AUTH-007)', () => {
    AuthService.register('Diana', 'diana@test.com', 'correctPass123', 'PATIENT');
    AuthService.logout();
    expect(() => {
      AuthService.login('diana@test.com', 'wrongPassword');
    }).toThrow('Invalid email or password');
  });

  it('clears session and removes storage item on logout (TC-AUTH-009)', () => {
    AuthService.loginWithDemo();
    expect(AuthService.getAuthState().isAuthenticated).toBe(true);

    const logoutState = AuthService.logout();
    expect(logoutState.isAuthenticated).toBe(false);
    expect(logoutState.user).toBeNull();
    expect(logoutState.isDemoUser).toBe(false);
    expect(localStorage.getItem('medlens_auth_state')).toBeNull();
  });
});
