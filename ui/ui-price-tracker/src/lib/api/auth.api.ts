import { apiRequest } from '@/lib/api-client';
import { mapUser } from '@/lib/mappers';
import type { ApiAuthResponse, ApiUserResponse } from '@/types/api.types';
import type { UserProfile } from '@/types/user.types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  locale?: string;
}

export async function login(payload: LoginPayload): Promise<{ token: string; user: UserProfile }> {
  const response = await apiRequest<ApiAuthResponse>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    false,
  );
  return { token: response.token, user: mapUser(response.user) };
}

export async function register(
  payload: RegisterPayload,
): Promise<{ token: string; user: UserProfile }> {
  const response = await apiRequest<ApiAuthResponse>(
    '/api/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    false,
  );
  return { token: response.token, user: mapUser(response.user) };
}

export async function getMe(): Promise<UserProfile> {
  const response = await apiRequest<ApiUserResponse>('/api/auth/me');
  return mapUser(response);
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  const response = await apiRequest<ApiUserResponse>('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return mapUser(response);
}
