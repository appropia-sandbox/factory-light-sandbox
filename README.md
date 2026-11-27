# factory-light-sandbox

App de pruebas que simula una app de cliente (Next.js 16, Auth.js v5, Prisma 6 sobre Postgres) para probar de punta a punta el plugin de Claude Code **factory-light** contra Vercel, Neon y Google reales.

## Variables de entorno

Ver `.env.example`:

- `DATABASE_URL`: conexión (pooler) a Neon.
- `DIRECT_URL`: conexión directa a Neon, usada por Prisma para migraciones.
- `AUTH_SECRET`: secreto de Auth.js.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: credenciales OAuth de Google.
- `ALLOWED_EMAIL_DOMAIN`: dominio de correo permitido (por defecto `appropia.com`).
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`: solo para el seed.

## Seed

Con las variables apuntando a la rama de producción de Neon:

```bash
SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... DATABASE_URL=... DIRECT_URL=... npm run seed
```

Crea (o actualiza) un usuario ADMIN y 3 notas de ejemplo.

## Entorno y rama de Neon

La página principal muestra `VERCEL_ENV`, la rama de git y el **hostname** de la base de datos (nunca usuario, contraseña ni la URL completa). Así se identifica qué rama de Neon usa cada despliegue.

## Scripts

`npm run dev`, `build` (migra y compila), `lint`, `typecheck`, `test`.

<!-- PR de prueba para la línea base del sandbox (27-nov). -->
