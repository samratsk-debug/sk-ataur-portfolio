import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignInModal } from '../editor/SignInModal';
import type { SessionApi } from '../hooks/usePortfolioSession';

// Mock the session API
const createMockSession = (overrides?: Partial<SessionApi>): SessionApi => ({
  repo: {
    resetPasswordForEmail: vi.fn(),
    updatePassword: vi.fn(),
    signIn: vi.fn(),
    secure: true,
    getPublished: vi.fn(),
    getDraft: vi.fn(),
    saveDraft: vi.fn(),
    publish: vi.fn(),
    discardDraft: vi.fn(),
    uploadAsset: vi.fn(),
    deleteAsset: vi.fn(),
    getSession: vi.fn(),
    signOut: vi.fn(),
    onAuthChange: vi.fn(),
  },
  session: null,
  loading: false,
  error: null,
  published: null,
  draft: null,
  isRecovering: false,
  setIsRecovering: vi.fn(),
  refresh: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  saveDraft: vi.fn(),
  publish: vi.fn(),
  discardDraft: vi.fn(),
  uploadAsset: vi.fn(),
  deleteAsset: vi.fn(),
  ...overrides,
} as any);

describe('SignInModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens the recovery form when Forgot Password is clicked', () => {
    const session = createMockSession();
    render(<SignInModal session={session} onClose={vi.fn()} />);
    
    fireEvent.click(screen.getByText('Forgot password?'));
    expect(screen.getByText('Reset Password')).toBeDefined();
    expect(screen.getByText('Send Link')).toBeDefined();
  });

  it('calls resetPasswordForEmail with the correct email', async () => {
    const session = createMockSession();
    render(<SignInModal session={session} onClose={vi.fn()} />);
    
    fireEvent.click(screen.getByText('Forgot password?'));
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Send Link'));

    await waitFor(() => {
      expect(session.repo?.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('shows success message after requesting reset', async () => {
    const session = createMockSession();
    render(<SignInModal session={session} onClose={vi.fn()} />);
    
    fireEvent.click(screen.getByText('Forgot password?'));
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText('Send Link'));

    await waitFor(() => {
      expect(screen.getByText('If an account exists for this address, a password recovery email will be sent.')).toBeDefined();
    });
  });

  it('forces the reset_update form when isRecovering is true', () => {
    const session = createMockSession({ isRecovering: true });
    render(<SignInModal session={session} onClose={vi.fn()} />);
    
    expect(screen.getByText('Set New Password')).toBeDefined();
  });

  it('validates matching passwords before updating', async () => {
    const session = createMockSession({ isRecovering: true });
    render(<SignInModal session={session} onClose={vi.fn()} />);
    
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password124' } });
    fireEvent.click(screen.getByText('Update Password'));

    expect(screen.getByText('Passwords do not match.')).toBeDefined();
    expect(session.repo?.updatePassword).not.toHaveBeenCalled();
  });

  it('calls updatePassword with the new password', async () => {
    const session = createMockSession({ isRecovering: true });
    render(<SignInModal session={session} onClose={vi.fn()} />);
    
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Update Password'));

    await waitFor(() => {
      expect(session.repo?.updatePassword).toHaveBeenCalledWith('password123');
    });
  });
});