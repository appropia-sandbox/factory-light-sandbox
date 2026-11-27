import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Faltan SEED_ADMIN_EMAIL y/o SEED_ADMIN_PASSWORD en el entorno.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, role: "ADMIN", active: true },
    create: { email: email.toLowerCase(), name: "Admin", passwordHash, role: "ADMIN" },
  });

  await db.nota.createMany({
    data: [{ texto: "Nota de ejemplo 1" }, { texto: "Nota de ejemplo 2" }, { texto: "Nota de ejemplo 3" }],
  });
  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
