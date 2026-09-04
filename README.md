# Wilo Studio — wilostudio.site

Sitio comercial, tienda y panel administrador de Wilo Studio. La aplicación usa Next.js App Router, TypeScript, Prisma, NextAuth, Tailwind CSS, Framer Motion, Lenis y Embla.

## Qué incluye

- Home comercial con loader de primera sesión, servicios, casos, Education, tienda, clientes, método, planes, FAQ y promoción administrable.
- Rutas de servicios, Wilo Education, portafolio, clientes, nosotros, promociones, referidos, contacto, cotizador y legales.
- Tienda con búsqueda/filtros, carrito persistente, ficha de producto y checkout para boleta/factura.
- Pedidos por pasarela, pago manual con voucher o WhatsApp. El adaptador de Mercado Pago queda desacoplado y Culqi reservado mediante variables de entorno.
- Wilo OS en `/admin`, protegido por credenciales, sesiones de 8 horas y roles `SUPER_ADMIN`, `ADMIN`, `COMMERCIAL` y `EDITOR` con permisos verificados en servidor por recurso y operación.
- CRM unificado para leads de Studio, Events, Education, Express y registros manuales; clientes, responsables, seguimientos, notas e historial auditable.
- Gestión interna de proyectos y CMS con flujo `DRAFT` / `REVIEW` / `PUBLISHED`. Un caso solo llega a `/proyectos` si supera las tres compuertas de publicación y no está archivado.
- Cotizaciones con partidas, importes enteros en centavos, cálculo autoritativo, estados controlados y numeración transaccional `WILO-AAAA-0001`.
- CRUD adicional para servicios, planes, productos, pedidos, testimonios, promociones, referidos, medios, usuarios y ajustes.
- Claves de licencia cifradas en reposo y entrega por correo al confirmar el pedido.
- Formularios con Zod, honeypot, límites de frecuencia, correo SMTP y persistencia real.
- Metadata, JSON-LD, sitemap, robots, manifest y salida standalone para VPS.

## Requisitos

- Node.js 20.9 o superior.
- npm 10 o superior.
- Desarrollo: SQLite.
- Producción: PostgreSQL 15 o superior, Nginx, PM2 y Certbot.

## Desarrollo local

1. Copia el archivo de entorno:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Completa como mínimo:

   - `NEXTAUTH_SECRET`: una cadena aleatoria larga.
   - `NEXTAUTH_URL=http://localhost:3000`
   - `SITE_URL=http://localhost:3000`
   - `ADMIN_EMAIL` y `ADMIN_PASSWORD` para crear el primer `SUPER_ADMIN`.
   - `LICENSE_ENCRYPTION_KEY`: 64 caracteres hexadecimales aleatorios.

3. Instala, genera la base y carga los datos aprobados:

   ```powershell
   npm ci
   npm run db:generate
   npm run db:push
   npm run db:seed
   npm run dev
   ```

4. Abre `http://localhost:3000`. El acceso administrativo está en `http://localhost:3000/admin/login`.

El seed es idempotente. No crea un superadministrador si faltan `ADMIN_EMAIL` o `ADMIN_PASSWORD`, no inventa productos/precios y deja la promoción de agosto inactiva hasta definir vigencia y activar el toggle.

## Validación antes de desplegar

```powershell
npm run lint
npm run typecheck
npm run build
```

## Producción en VPS (Ubuntu)

### 1. Sistema y PostgreSQL

```bash
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib certbot python3-certbot-nginx
sudo npm install -g pm2
sudo -u postgres psql
```

Dentro de PostgreSQL:

```sql
CREATE USER wilo WITH ENCRYPTED PASSWORD 'CAMBIA_ESTA_CONTRASENA';
CREATE DATABASE wilo_studio OWNER wilo;
\q
```

### 2. Aplicación

```bash
sudo mkdir -p /var/www/wilostudio
sudo chown -R "$USER":"$USER" /var/www/wilostudio
cd /var/www/wilostudio
git clone TU_REPOSITORIO .
npm ci
cp .env.example .env
```

Configura `.env`:

```dotenv
DATABASE_URL="postgresql://wilo:CONTRASENA@127.0.0.1:5432/wilo_studio?schema=public"
SITE_URL="https://wilostudio.site"
NEXTAUTH_URL="https://wilostudio.site"
NEXTAUTH_SECRET="SECRETO_LARGO"
ADMIN_EMAIL="correo-del-admin"
ADMIN_PASSWORD="CONTRASENA_INICIAL_SEGURA"
LICENSE_ENCRYPTION_KEY="64_CARACTERES_HEXADECIMALES"
WHATSAPP_NUMBER="51936617557"
MEDIA_UPLOAD_ROOT="/var/lib/wilostudio/uploads"
PRIVATE_STORAGE_ROOT="/var/lib/wilostudio/private"
```

Completa también SMTP y Mercado Pago/Culqi cuando vayan a activarse.

Crea las raíces persistentes antes de iniciar la aplicación. PM2 debe ejecutarse con el mismo usuario propietario de estas carpetas; Nginx solo recibe acceso de lectura a los medios públicos:

```bash
sudo install -d -o "$USER" -g www-data -m 0750 /var/lib/wilostudio
sudo install -d -o "$USER" -g www-data -m 0750 /var/lib/wilostudio/uploads
sudo install -d -o "$USER" -g "$USER" -m 0700 /var/lib/wilostudio/private
```

Si ya existen archivos de una instalación anterior, migra su contenido una sola vez. Las referencias guardadas en la base no cambian:

```bash
cp -a public/uploads/. /var/lib/wilostudio/uploads/
cp -a storage/. /var/lib/wilostudio/private/
```

Genera el cliente para PostgreSQL, aplica las migraciones versionadas y carga el seed:

```bash
npm run db:generate:prod
npm run db:migrate:deploy
npm run db:seed
npm run build
cp -r public .next/standalone/
rm -rf .next/standalone/public/uploads
ln -s /var/lib/wilostudio/uploads .next/standalone/public/uploads
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Ejecuta el comando adicional que imprima `pm2 startup` con privilegios de administrador.

El proceso standalone arranca con `node --env-file=.env`: `ecosystem.config.cjs` mantiene como directorio de trabajo la raíz del proyecto, por lo que el archivo `.env` permanece fuera de `.next/standalone` y se carga en cada inicio. Después de cambiar variables usa `pm2 restart wilo-studio --update-env`.

### 3. Nginx y HTTPS

```bash
sudo cp deploy/nginx-wilostudio.conf /etc/nginx/sites-available/wilostudio.site
sudo ln -s /etc/nginx/sites-available/wilostudio.site /etc/nginx/sites-enabled/wilostudio.site
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d wilostudio.site -d www.wilostudio.site
```

Certbot configura la redirección HTTPS y renueva el certificado automáticamente.

### 4. Actualizaciones

```bash
cd /var/www/wilostudio
git pull --ff-only
npm ci
npm run db:generate:prod
npm run db:migrate:deploy
npm run build
cp -r public .next/standalone/
rm -rf .next/standalone/public/uploads
ln -s /var/lib/wilostudio/uploads .next/standalone/public/uploads
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/
pm2 restart wilo-studio --update-env
```

### Migrar una instalación PostgreSQL anterior

Las migraciones están divididas en una línea base del esquema previo y una ampliación aditiva de Wilo OS. Si la base ya contiene las tablas de la versión anterior y nunca usó Prisma Migrate:

1. Detén las escrituras y crea un `pg_dump` verificable.
2. Confirma que `DATABASE_URL` apunta a la base correcta.
3. Marca únicamente la línea base como ya aplicada:

   ```bash
   npx prisma migrate resolve --applied 20260901173000_baseline --schema prisma/schema.postgresql.prisma
   ```

4. Revisa el estado y ejecuta la ampliación:

   ```bash
   npm run db:migrate:status
   npm run db:migrate:deploy
   ```

La migración `20260901180000_wilo_os` es aditiva: agrega columnas, índices, relaciones y las tablas de cotizaciones, actividad, notas y recuperación de contraseña; no elimina tablas ni columnas existentes. En una instalación nueva no uses `migrate resolve`: `db:migrate:deploy` aplica ambas migraciones desde cero.

## Seguridad de Wilo OS

- `SUPER_ADMIN` administra equipo y configuración; `ADMIN` opera CRM, proyectos, cotizaciones y contenido; `COMMERCIAL` trabaja leads, clientes, cotizaciones, notas y proyectos asignados; `EDITOR` solo accede a contenido, casos y medios.
- Las APIs verifican sesión, rol y operación en servidor. Las mutaciones con cookie rechazan orígenes ajenos y los formularios validan con Zod.
- El restablecimiento de contraseña usa un token aleatorio, guarda solo su hash, vence en 30 minutos y revoca las sesiones anteriores mediante `sessionVersion`. Requiere SMTP configurado.
- Los límites de frecuencia actuales viven en memoria y son apropiados para el despliegue PM2 de una sola instancia. Si se ejecutan varias instancias, reemplázalos por un almacén compartido como Redis.
- Leads, clientes, proyectos y cotizaciones se archivan/restauran; no se eliminan físicamente desde la interfaz.

## Archivos, vouchers y backups

- `MEDIA_UPLOAD_ROOT` es la raíz persistente de archivos públicos. La aplicación escribe en su subcarpeta `media/` y conserva URLs `/uploads/media/...`; el `alias` de Nginx debe apuntar a la misma raíz.
- El enlace `.next/standalone/public/uploads` permite que el optimizador de imágenes de Next.js lea esos mismos archivos. Se recrea después de cada build; el `rm` de los comandos de despliegue solo elimina la copia dentro del artefacto, nunca `/var/lib/wilostudio/uploads`.
- `PRIVATE_STORAGE_ROOT` guarda vouchers bajo `vouchers/`. Debe estar fuera del release, separado de `MEDIA_UPLOAD_ROOT` y nunca debe publicarse mediante Nginx. Los vouchers se leen solo por la ruta administrativa protegida.
- Si las variables no están definidas, desarrollo usa `public/uploads` y `storage`. En producción usa siempre rutas absolutas persistentes como las del ejemplo.
- Nginx limita la petición a 6 MB y el servidor valida tipo real y máximo de 5 MB.
- Los campos visuales solo admiten rutas locales JPG, PNG o WebP. La biblioteca puede conservar PDF como documento y los vouchers PDF siguen admitidos, pero un PDF no puede asignarse como portada, logo o galería.
- Programa un backup diario de PostgreSQL y de ambas raíces persistentes. Los backups de `private/` contienen documentos sensibles: cifra el destino y limita sus permisos.

Ejemplo manual (automatízalo con systemd timer o cron y una política de retención):

```bash
sudo install -d -m 0700 /var/backups/wilostudio
sudo -u postgres pg_dump -Fc wilo_studio -f "/var/backups/wilostudio/db-$(date +%F).dump"
sudo tar -C /var/lib/wilostudio -czf "/var/backups/wilostudio/files-$(date +%F).tar.gz" uploads private
```

Verifica periódicamente la restauración en un entorno aislado. Un backup no está completo si solo incluye la base de datos: las filas de medios y vouchers referencian archivos de estas carpetas.

## Integraciones

- SMTP: completa `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` y `SMTP_TO`.
- Mercado Pago: completa `MP_PUBLIC_KEY`, `MP_ACCESS_TOKEN` y `MP_WEBHOOK_SECRET`; registra `https://wilostudio.site/api/pagos/mercado-pago/webhook` como webhook.
- Culqi: las variables están reservadas para cambiar de proveedor sin alterar el checkout.
- El correo `hola@wilostudio.com` está pendiente de confirmación del dueño antes de producción.

## Decisiones de contenido

- Los planes web se muestran como precio base más IGV, siguiendo las tarjetas y el brief. La leyenda contradictoria del PDF no se replica.
- Los productos sin precio verificado funcionan como solicitud de cotización; no se cobra ni se muestra un importe inventado.
- Dayun Perú y Reloj Shop se etiquetan como demos porque el material local los identifica así.
- Las promociones requieren fecha y activación desde el admin. Fuera de vigencia no aparecen en Home.
- El material interno, accesos directos, credenciales y documentos de dominios nunca se publican.
