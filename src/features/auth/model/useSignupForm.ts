import { useState } from 'react';
import { requestEmailCode, verifyEmailCode } from '@/features/auth/api/signup';
import { isFakeApiEnabled } from '@/shared/lib/env';
import { saveSignupDraft } from './signupDraft';

export function useSignupForm(onSuccess: () => void) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setIsEmailVerified(false);
    setIsCodeSent(false);
    setCode('');
    setErrorMessage('');
  };

  const handleSendCode = async () => {
    const normalizedEmail = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setErrorMessage('올바른 이메일 주소를 입력해주세요.');
      return;
    }
    setIsSendingCode(true);
    setErrorMessage('');
    try {
      if (!isFakeApiEnabled) await requestEmailCode(normalizedEmail);
      setIsCodeSent(true);
      setIsEmailVerified(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '인증번호를 보내지 못했어요.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setErrorMessage('인증번호를 입력해주세요.');
      return;
    }
    setIsVerifyingCode(true);
    setErrorMessage('');
    try {
      if (!isFakeApiEnabled) await verifyEmailCode(email.trim(), code.trim());
      setIsEmailVerified(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '인증번호를 확인하지 못했어요.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setErrorMessage('');
  };
  const handlePasswordConfirmChange = (value: string) => {
    setPasswordConfirm(value);
    setErrorMessage('');
  };

  const handleSubmit = () => {
    if (!isEmailVerified) {
      setErrorMessage('이메일 인증을 완료해주세요.');
      return;
    }
    if (!password || !passwordConfirm) return;
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)) {
      setErrorMessage('비밀번호는 영문과 숫자를 포함해 8자 이상 입력해주세요.');
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMessage('비밀번호가 일치하지 않아요.');
      return;
    }
    saveSignupDraft({ email: email.trim(), password });
    onSuccess();
  };

  return {
    email, handleEmailChange, code, setCode, password, handlePasswordChange,
    passwordConfirm, handlePasswordConfirmChange, errorMessage, isCodeSent,
    isEmailVerified, isSendingCode, isVerifyingCode, handleSendCode,
    handleVerifyCode, handleSubmit,
  };
}
