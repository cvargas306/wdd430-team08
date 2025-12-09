import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_SECRET || 'fallback-refresh-secret');

export interface UserPayload {
  user_id: string;
  email: string;
  name: string;
  is_seller: boolean;
  seller_id?: string;
  [key: string]: any; // For JWTPayload compatibility
}

export interface TokenPayload extends UserPayload {
  iat: number;
  exp: number;
  [key: string]: any; // For JWTPayload compatibility
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createAccessToken(payload: UserPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m') // 15 minutes
    .sign(JWT_SECRET);
}

export async function createRefreshToken(payload: UserPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 days
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookies(user: UserPayload) {
  const accessToken = await createAccessToken(user);
  const refreshToken = await createRefreshToken(user);

  const cookieStore = await cookies();

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  });

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
}

export async function getUserFromToken(): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) return null;

    const payload = await verifyAccessToken(accessToken);
    if (!payload) return null;

    return {
      user_id: payload.user_id,
      email: payload.email,
      name: payload.name,
      is_seller: payload.is_seller,
      seller_id: payload.seller_id,
    };
  } catch {
    return null;
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) return null;

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) return null;

    const user: UserPayload = {
      user_id: payload.user_id,
      email: payload.email,
      name: payload.name,
      is_seller: payload.is_seller,
      seller_id: payload.seller_id,
    };

    // Set new tokens
    await setAuthCookies(user);

    // Return new access token
    return createAccessToken(user);
  } catch {
    return null;
  }
}