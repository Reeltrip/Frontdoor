import type { SignupPayload } from '@/features/auth/api/signup';

const SIGNUP_DRAFT_KEY = 'wayvi.signupDraft';

export type SignupDraft = Pick<SignupPayload, 'email' | 'password'>;

export function saveSignupDraft(draft: SignupDraft) {
  sessionStorage.setItem(SIGNUP_DRAFT_KEY, JSON.stringify(draft));
}

export function readSignupDraft(): SignupDraft | null {
  const value = sessionStorage.getItem(SIGNUP_DRAFT_KEY);
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed === 'object' && parsed !== null &&
      typeof (parsed as Record<string, unknown>).email === 'string' &&
      typeof (parsed as Record<string, unknown>).password === 'string') {
      return parsed as SignupDraft;
    }
  } catch {
    sessionStorage.removeItem(SIGNUP_DRAFT_KEY);
  }
  return null;
}

export function clearSignupDraft() {
  sessionStorage.removeItem(SIGNUP_DRAFT_KEY);
}
