import { prisma } from "../config/prisma.js";
import type { GoogleProfile } from "../integrations/google/googleOAuth.js";

export async function findOrCreateUserFromGoogle(profile: GoogleProfile) {
  return prisma.user.upsert({
    where: { googleId: profile.googleId },
    update: {
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatarUrl
    },
    create: {
      googleId: profile.googleId,
      name: profile.name,
      email: profile.email,
      avatarUrl: profile.avatarUrl
    }
  });
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}
