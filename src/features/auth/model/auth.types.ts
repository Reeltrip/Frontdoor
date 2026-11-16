// POST /auth/login (BE Swagger 기준)
export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  userId: number;
  nickname: string;
  accessToken: string;
  refreshToken: string;
};
