#!/bin/sh

echo "Waiting for PostgreSQL..."
sleep 15

echo "Generating Prisma Client..."
pnpm prisma generate

echo "Pushing database schema..."
pnpm prisma:push

echo "Starting application..."
pnpm start
