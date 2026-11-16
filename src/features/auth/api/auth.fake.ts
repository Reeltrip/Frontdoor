// 가짜 응답: VITE_USE_FAKE_API가 false가 아닐 때 쓰는 로그인.
// 비밀번호가 test1234면 성공해요 (FE 2가 만든 가짜 로그인과 같은 값)
import { ApiError } from '@/shared/api/client';
import { fakeResponse } from '@/shared/api/fake';
import type { LoginRequest, LoginResponse } from '../model/auth.types';

export const FAKE_LOGIN_PASSWORD = 'test1234';

export const fakeAuthApi = {
  login: ({ email, password }: LoginRequest) =>
    fakeResponse((): LoginResponse => {
      if (password !== FAKE_LOGIN_PASSWORD) {
        throw new ApiError({ status: 401, code: 'INVALID_LOGIN', message: '이메일 또는 비밀번호를 확인해주세요' });
      }
      return {
        userId: 1,
        nickname: email.split('@')[0] || '여행자',
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token',
      };
    }),
};
