import { Gender } from "../generated/prisma/enums";
import { envVars } from "../config/env";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seedAdmin = async () => {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { isAdmin: true },
    });

    if (existingAdmin) {
      console.log("Admin already exists. Skipping admin seeding.");
      return;
    }

    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: envVars.ADMIN_EMAIL,
        password: envVars.ADMIN_PASSWORD,
        name: "RideShare Admin",
        gender: Gender.MALE,
      },
    });

    await prisma.user.update({
      where: { id: signUpResult.user.id },
      data: {
        emailVerified: true,
        isAdmin: true,
      },
    });

    console.log("Admin seeded successfully:", signUpResult.user.email);
  } catch (error) {
    console.error("Error seeding admin:", error);

    const seededAdmin = await prisma.user.findUnique({
      where: { email: envVars.ADMIN_EMAIL },
    });

    if (seededAdmin && !seededAdmin.isAdmin) {
      await prisma.user.delete({ where: { id: seededAdmin.id } });
    }
  }
};
