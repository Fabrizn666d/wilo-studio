# Base de datos local

1. Copia `.env.example` a `.env` y define, como mínimo, `DATABASE_URL` y `NEXTAUTH_SECRET`.
2. Define `ADMIN_EMAIL` y una `ADMIN_PASSWORD` de 12 caracteres o más si deseas crear el usuario inicial.
3. Ejecuta `npx prisma generate` y `npx prisma db push`.
4. Ejecuta `node prisma/seed.mjs`.

El seed es idempotente. Si no se definen las variables del administrador, carga el contenido real y omite la creación de usuarios.
