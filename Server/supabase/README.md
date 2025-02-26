# Supabase Backend

Esta carpeta contiene la configuración y scripts necesarios para ejecutar Supabase localmente como backend para la aplicación.

## Estructura

- `config.toml`: Configuración de Supabase
- `kong.yml`: Configuración de Kong (API Gateway)
- `migrations/`: Migraciones de la base de datos
- `seed.sql`: Datos iniciales para la base de datos
- `server-client.ts`: Cliente de Supabase para operaciones del servidor
- `init.ts`: Funciones para inicializar la base de datos
- `start.sh`: Script para iniciar Supabase localmente

## Requisitos

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Docker
- Node.js

## Cómo iniciar Supabase localmente

1. Asegúrate de tener Docker en ejecución
2. Ejecuta el script de inicio:

```bash
./Server/supabase/start.sh
```

3. Una vez iniciado, puedes acceder a:
   - API: http://localhost:54321
   - Studio: http://localhost:54323

## Variables de entorno

Asegúrate de tener las siguientes variables de entorno configuradas:

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Puedes obtener las claves ejecutando `supabase status` después de iniciar los servicios.

## Migraciones

Para crear una nueva migración:

```bash
supabase migration new nombre_de_la_migracion
```

Para aplicar las migraciones:

```bash
supabase db reset
```

## Semillas

El archivo `seed.sql` contiene datos iniciales para la base de datos. Se ejecuta automáticamente al aplicar las migraciones.

## Funciones y procedimientos almacenados

Las funciones y procedimientos almacenados se definen en las migraciones. Consulta la carpeta `migrations/` para más detalles.
