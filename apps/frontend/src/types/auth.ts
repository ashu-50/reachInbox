/**
 * Matches prisma.User exactly as returned by GET /api/auth/me
 * (apps/backend/src/controllers/auth.controller.ts -> sendSuccess(res, { user })).
 * Dates arrive as ISO strings once serialized through res.json().
 */
export interface User {
  id: string;
  googleId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}