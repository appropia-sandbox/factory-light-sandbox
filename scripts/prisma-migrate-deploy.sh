#!/usr/bin/env bash
set -e

# En previews con rama propia de Neon, migrar contra esa misma rama.
if [ "${VERCEL_ENV:-}" = "preview" ] && [ -n "${DATABASE_URL_UNPOOLED:-}" ]; then
  export DIRECT_URL="$DATABASE_URL_UNPOOLED"
fi

attempts=3
for i in $(seq 1 "$attempts"); do
  if npx prisma migrate deploy; then
    exit 0
  fi
  if [ "$i" -lt "$attempts" ]; then
    echo "prisma migrate deploy fallo (intento $i/$attempts); reintentando en 5s..."
    sleep 5
  fi
done
echo "prisma migrate deploy fallo tras $attempts intentos"
exit 1
