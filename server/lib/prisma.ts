let prismaInstance: any = null;

export async function getPrisma() {
  if (!prismaInstance) {
    const { PrismaClient } = await import("../../generated/prisma");

    const globalForPrisma = globalThis as unknown as {
      prisma: any | undefined;
    };

    prismaInstance = globalForPrisma.prisma ?? new PrismaClient();

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaInstance;
    }
  }

  return prismaInstance;
}
