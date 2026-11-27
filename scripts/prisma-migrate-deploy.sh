#!/usr/bin/env bash
set -e

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
