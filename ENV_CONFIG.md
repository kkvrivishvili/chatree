# Sistema Centralizado de Variables de Entorno en Chatree

Este documento describe el enfoque de gestión centralizada de variables de entorno implementado en Chatree.

## Visión General

Chatree utiliza un sistema centralizado de variables de entorno a través de un único archivo `.env` ubicado en la raíz del proyecto. Este enfoque tiene varias ventajas:

1. **Consistencia**: Todas las variables se definen una sola vez, evitando valores diferentes en distintas partes del sistema
2. **Mantenibilidad**: Es más fácil mantener y actualizar un solo archivo
3. **Trazabilidad**: Facilita el seguimiento de cambios en la configuración
4. **Simplicidad**: Reduce la complejidad al tener un único punto de verdad

## Estructura del Sistema

### Componentes Principales

1. **Archivo `.env` centralizado**: Contiene todas las variables del sistema
2. **Enlaces simbólicos**: El frontend usa un enlace simbólico al archivo central
3. **Docker Compose**: Todas las imágenes cargan variables desde el archivo central
4. **Sistema de verificación**: Comprueba variables críticas y posibles errores de configuración

### Funcionamiento

1. El script `env_setup.sh` gestiona la creación y verificación del archivo `.env`
2. Verifica que todas las variables críticas estén presentes y con valores válidos
3. Elimina archivos `.env` duplicados en los subdirectorios (opcional)
4. Crea enlaces simbólicos necesarios para el frontend
5. Comprueba problemas comunes en la configuración

## Variables Principales

Las variables están organizadas en grupos:

### Supabase

```
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
POSTGRES_PASSWORD=...
SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Redis

```
REDIS_PASSWORD=...
REDIS_URL=...
```

### LangChain

```
LANGCHAIN_API_KEY=...
LANGCHAIN_PROJECT=...
```

### GitHub OAuth

```
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

## Diferentes Contextos de Ejecución

El sistema maneja correctamente los diferentes contextos:

1. **Servicios Docker internos**: Usan URLs como `http://supabase:8000` (nombres de servicios)
2. **Frontend (navegador)**: Usa URLs públicas como `http://localhost:54321`
3. **Desarrollo local**: Variables cargadas directamente desde el archivo `.env`

## Verificación de Configuración

El sistema incluye verificaciones para detectar problemas comunes:

* URLs de Supabase incorrectas para el frontend
* Claves anónimas inconsistentes
* Contraseñas débiles en entornos de producción
* Configuraciones inconsistentes de URLs

## Actualización de Variables

Para actualizar las variables:

1. Edita el archivo `.env` en la raíz del proyecto
2. Reinicia los servicios con `docker compose down && docker compose up -d`

Para entornos de producción, se recomienda:

1. Cambiar todas las contraseñas predeterminadas
2. Usar claves de API reales, no las predeterminadas
3. Revisar cuidadosamente las URLs para asegurar que son accesibles correctamente

## Solución de Problemas

Si encuentras problemas con las variables de entorno:

1. Verifica que el archivo `.env` esté en la raíz del proyecto
2. Ejecuta `./start.sh` para que verifique y corrija problemas automáticamente
3. Comprueba que no hay archivos `.env` duplicados en subdirectorios
4. Verifica que los valores de las variables sean correctos para cada contexto

Para problemas específicos del frontend:
- Asegúrate de que `NEXT_PUBLIC_SUPABASE_URL` sea accesible desde el navegador
- Las variables que necesita el frontend deben tener el prefijo `NEXT_PUBLIC_`
