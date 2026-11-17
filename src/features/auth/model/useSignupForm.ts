import { useState } from 'react';
import { requestEmailCode, verifyEmailCode } from '@/features/auth/api/signup';
import { saveSignupDraft } from './signupDraft';

export type SignupStep = 'email' | 'code' | 'password';

export const SIGNUP_STEPS: SignupStep[] = ['email', 'code', 'password'];
export const CODE_LENGTH = 6;
export const PASSWORD_MIN_LENGTH = 8;

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export function isValidPassword(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH && /[A-Za-z]/.test(password) && /\d/.test(password);
}

export function useSignupForm(onSuccess: () => void) {
  const [step, setStep] = useState<SignupStep>('email');
  const [email, setEmailValue] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [isCodeFailed, setIsCodeFailed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const canNext = !isBusy && {
    email: EMAIL_PATTERN.test(email.trim()),
    code: code.length === CODE_LENGTH,
    password: isValidPassword(password),
  }[step];

  const setEmail = (value: string) => {
    setEmailValue(value);
    setCode('');
    setErrorMessage('');
    setIsCodeFailed(false);
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    setIsCodeFailed(false);
    setErrorMessage('');
  };

  const goBack = (onFirstStepBack: () => void) => {
    const index = SIGNUP_STEPS.indexOf(step);
    if (index === 0) onFirstStepBack();
    else setStep(SIGNUP_STEPS[index - 1]);
  };

  const handleSubmit = async () => {
    if (!canNext) return;
    setErrorMessage('');
    setIsBusy(true);
    try {
      if (step === 'email') {
        await requestEmailCode(email.trim());
        setStep('code');
      } else if (step === 'code') {
        try {
          await verifyEmailCode(email.trim(), code);
          setStep('password');
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : '인증번호를 확인하지 못했어요.');
          setIsCodeFailed(true);
        }
      } else {
        saveSignupDraft({ email: email.trim(), password });
        onSuccess();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '요청을 완료하지 못했어요.');
    } finally {
      setIsBusy(false);
    }
  };

  const retryCode = () => {
    setIsCodeFailed(false);
    setCode('');
    setErrorMessage('');
  };

  return {
    step,
    email,
    setEmail,
    code,
    handleCodeChange,
    password,
    setPassword,
    canNext,
    isCodeFailed,
    retryCode,
    goBack,
    handleSubmit,
    isBusy,
    errorMessage,
  };
}
