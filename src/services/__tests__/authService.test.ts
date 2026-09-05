import '../../testSetup';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../authService';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    AuthService.logout();
  });

  it('initializes with unauthenticated default state when storage is empty', () => {
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

  it('authenticates demo user correctly', () => {
    const state = AuthService.loginWithDemo();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isDemoUser).toBe(true);
    expect(state.user?.name).toBe('Dr. Kenneth Reed, MD');
    expect(state.user?.role).toBe('HEALTHCARE_PROFESSIONAL');
    expect(state.token).toBeDefined();

    // Verify localStorage persistence
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

  it('registers new patient user correctly', () => {
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

  it('clears session and removes storage item on logout', () => {
    AuthService.loginWithDemo();
    expect(AuthService.getAuthState().isAuthenticated).toBe(true);

    const logoutState = AuthService.logout();
    expect(logoutState.isAuthenticated).toBe(false);
    expect(logoutState.user).toBeNull();
    expect(logoutState.isDemoUser).toBe(false);
    expect(localStorage.getItem('medlens_auth_state')).toBeNull();
  });
});
