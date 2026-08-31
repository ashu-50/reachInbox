import { prisma } from "../config/prisma.js";
export async function findOrCreateUserFromGoogle(profile) {
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
export async function getUserById(userId) {
    return prisma.user.findUnique({ where: { id: userId } });
}
//# sourceMappingURL=auth.service.js.map