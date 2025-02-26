# Chatree - SaaS Mini Pages con Agentes IA

Chatree es una plataforma SaaS tipo Linktree que permite a los usuarios crear páginas personalizadas con agentes IA integrados, entrenados mediante RAG (Retrieval Augmented Generation) para responder preguntas en el chat de cada perfil.

## Arquitectura

El proyecto utiliza las siguientes tecnologías:

- **Frontend**: React/Next.js
- **Backend**:
  - Supabase (Auth, Database, Vector Store, Storage, Realtime)
  - Ollama (LLM - Llama 3 8B)
  - LangChain (Python) para orquestación de agentes IA
  - Redis para caché y gestión de sesiones

## Estructura del Proyecto

### Organización de Carpetas

- **app/**: Frontend en Next.js
  - **src/**: Código fuente del frontend
    - **app/**: Rutas y páginas de Next.js
    - **components/**: Componentes reutilizables
    - **features/**: Funcionalidades organizadas por dominio
    - **lib/**: Utilidades y configuraciones
    - **supabase/**: Cliente de Supabase para el frontend

- **Server/**: Backend y servicios
  - **langchain/**: Servidor de LangChain
    - **agents/**: Definiciones de agentes
    - **chains/**: Cadenas de procesamiento
    - **utils/**: Utilidades para LangChain
  - **supabase/**: Configuración de Supabase
    - **migrations/**: Migraciones SQL para Supabase
    - **seed.sql**: Datos iniciales para la base de datos
    - **config.toml**: Configuración de Supabase CLI

> **IMPORTANTE**: Antes de crear nuevos archivos, analiza el código existente en la ubicación correspondiente para mantener la coherencia y evitar duplicaciones. Toda la lógica debe estar centralizada en sus carpetas respectivas.

```
chatree/
├── app/                   # Aplicación frontend (Next.js)
├── Server/
│   ├── langchain/         # Servidor LangChain para gestión de agentes
│   ├── supabase/          # Configuración y migraciones de Supabase
│   └── ollama/            # Configuración de Ollama (modelos, etc.)
├── docker-compose.yml     # Configuración de Docker para todo el proyecto
└── .env                   # Variables de entorno
```

## Requisitos

- Docker y Docker Compose
- Git

## Plan de Implementación

### Fase 1: Configuración Base (Infraestructura)

1. **Configuración de Docker**
   - [x] Crear docker-compose.yml con servicios base
   - [x] Configurar Dockerfiles para cada servicio
   - [ ] Añadir Redis para caché y gestión de sesiones
   - [ ] Configurar volúmenes para persistencia de datos
   - [ ] Establecer redes Docker para comunicación entre servicios

2. **Configuración de Supabase**
   - [x] Definir esquema inicial de base de datos
   - [ ] Configurar extensiones (pgvector, etc.)
   - [ ] Implementar migraciones para evolución del esquema
   - [ ] Configurar políticas RLS (Row Level Security)
   - [ ] Configurar autenticación y proveedores de identidad

3. **Configuración de Ollama**
   - [ ] Preparar modelos Llama 3 8B para uso local
   - [ ] Configurar API para acceso desde LangChain
   - [ ] Optimizar parámetros de rendimiento
   - [ ] Implementar sistema de caché para respuestas LLM

4. **Configuración de Redis**
   - [ ] Implementar caché para resultados de embeddings
   - [ ] Configurar almacenamiento de sesiones
   - [ ] Implementar sistema de límites de tasa (rate limiting)
   - [ ] Configurar persistencia para datos críticos

### Fase 2: Desarrollo Backend

1. **API LangChain (Python)**
   - [x] Crear servidor FastAPI básico
   - [ ] Implementar endpoints para gestión de agentes
   - [ ] Desarrollar sistema RAG con Supabase pgvector
   - [ ] Integrar con Ollama para generación de respuestas
   - [ ] Implementar caché Redis para optimización
   - [ ] Añadir sistema de logging y monitoreo

2. **Integración con Supabase**
   - [ ] Implementar funciones para gestión de usuarios
   - [ ] Desarrollar sistema de almacenamiento de documentos
   - [ ] Configurar búsqueda vectorial para RAG
   - [ ] Implementar sistema de chat en tiempo real

### Fase 3: Desarrollo Frontend

1. **Interfaz de Usuario**
   - [ ] Desarrollar páginas de perfil tipo Linktree
   - [ ] Implementar panel de administración para usuarios
   - [ ] Crear interfaz para gestión de agentes
   - [ ] Desarrollar componente de chat para interacción con agentes

2. **Integración con Backend**
   - [ ] Conectar con Supabase para autenticación y datos
   - [ ] Integrar con API LangChain para funcionalidad de agentes
   - [ ] Implementar sistema de carga de documentos para RAG
   - [ ] Desarrollar interfaz para monitoreo de uso

### Fase 4: Pruebas y Optimización

1. **Pruebas**
   - [ ] Realizar pruebas de integración entre servicios
   - [ ] Probar rendimiento del sistema RAG
   - [ ] Validar seguridad y políticas de acceso
   - [ ] Verificar funcionamiento en diferentes dispositivos

2. **Optimización**
   - [ ] Ajustar configuración de Redis para máximo rendimiento
   - [ ] Optimizar consultas a Supabase
   - [ ] Mejorar rendimiento de LLM con Ollama
   - [ ] Implementar estrategias de caché avanzadas

### Fase 5: Despliegue

1. **Preparación para Producción**
   - [ ] Configurar variables de entorno para producción
   - [ ] Implementar sistema de respaldo automático
   - [ ] Configurar monitoreo y alertas
   - [ ] Documentar proceso de despliegue

2. **Despliegue**
   - [ ] Configurar servidor de producción
   - [ ] Desplegar con Docker Compose
   - [ ] Configurar dominio y certificados SSL
   - [ ] Implementar CI/CD para actualizaciones

## Implementación de Autenticación con Supabase

### Configuración Actual

La autenticación está implementada utilizando Supabase Auth con las siguientes características:

1. **Métodos de Autenticación**:
   - Email/Password: Registro e inicio de sesión con email y contraseña
   - OAuth con GitHub: Autenticación social mediante GitHub

2. **Componentes Implementados**:
   - Formularios de registro e inicio de sesión
   - Callback para OAuth
   - Middleware para protección de rutas
   - Gestión de sesiones

3. **Seguridad**:
   - Row Level Security (RLS) en todas las tablas
   - Políticas de acceso basadas en el usuario autenticado
   - Almacenamiento seguro de tokens

### Estructura de Base de Datos

Se han configurado las siguientes tablas con sus respectivas políticas RLS:

- **profiles**: Información del usuario vinculada a auth.users
- **links**: Enlaces personalizados del usuario
- **agents**: Agentes de IA configurados por el usuario
- **documents**: Documentos vectorizados para RAG
- **chat_history**: Historial de conversaciones con agentes

### Flujo de Autenticación

1. **Registro de Usuario**:
   - El usuario se registra con email/password o GitHub
   - Se crea automáticamente un perfil en la tabla profiles
   - Se envía email de confirmación (si está habilitado)

2. **Inicio de Sesión**:
   - Autenticación mediante credenciales o OAuth
   - Generación de tokens JWT
   - Redirección al dashboard

3. **Protección de Rutas**:
   - Middleware verifica la sesión del usuario
   - Redirección a login si no está autenticado
   - Redirección a dashboard si ya está autenticado

### Configuración del Entorno

Para configurar correctamente la autenticación, sigue estos pasos:

1. **Configuración de Variables de Entorno**:
   - Actualiza el archivo `.env` con tus credenciales de GitHub OAuth
   - Asegúrate de que `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` estén configurados

2. **Inicialización de la Base de Datos**:
   - Ejecuta Docker Compose para iniciar los servicios
   - Ejecuta el script de inicialización: `./Server/supabase/init.sh`

3. **Configuración de OAuth (GitHub)**:
   - Crea una aplicación OAuth en GitHub
   - Configura la URL de callback: `http://localhost:3000/auth/callback`
   - Actualiza las credenciales en el archivo `.env`

### Próximos Pasos

- Implementar recuperación de contraseña
- Añadir más proveedores OAuth (Google, Twitter)
- Mejorar la gestión de perfiles de usuario
- Implementar verificación en dos pasos

## Reglas de Desarrollo (Windsurf Rules)

### Organización del Código

1. **Estructura de Carpetas**
   - Mantener separación clara entre frontend y backend
   - Organizar código por funcionalidad, no por tipo de archivo
   - Usar nombres descriptivos para archivos y carpetas

2. **Convenciones de Nombrado**
   - Frontend: camelCase para variables, PascalCase para componentes
   - Backend: snake_case para variables y funciones, PascalCase para clases
   - SQL: snake_case para tablas y columnas, mayúsculas para palabras clave

3. **Documentación**
   - Documentar todas las funciones y clases con docstrings
   - Mantener README actualizado con cambios importantes
   - Comentar código complejo o no intuitivo

### Control de Versiones

1. **Ramas**
   - `main`: código estable y listo para producción
   - `develop`: integración de características
   - `feature/nombre`: desarrollo de nuevas características
   - `fix/nombre`: corrección de errores

2. **Commits**
   - Usar mensajes descriptivos que expliquen el "qué" y el "por qué"
   - Mantener commits pequeños y enfocados
   - Referenciar números de issue cuando sea aplicable

### Docker y Desarrollo

1. **Optimización de Imágenes**
   - Usar imágenes base ligeras (alpine cuando sea posible)
   - Implementar multi-stage builds para reducir tamaño
   - Minimizar capas y optimizar orden de comandos

2. **Volúmenes y Persistencia**
   - Usar volúmenes nombrados para datos persistentes
   - Implementar estrategias de respaldo para volúmenes
   - Documentar la estructura de volúmenes

3. **Redes**
   - Aislar servicios en redes dedicadas
   - Exponer solo los puertos necesarios
   - Usar nombres descriptivos para redes

### Seguridad

1. **Gestión de Secretos**
   - Nunca incluir secretos en el código fuente
   - Usar variables de entorno o servicios de gestión de secretos
   - Rotar credenciales regularmente

2. **Acceso a Datos**
   - Implementar Row Level Security en Supabase
   - Validar todas las entradas de usuario
   - Aplicar principio de mínimo privilegio

3. **API y Endpoints**
   - Implementar autenticación para todos los endpoints sensibles
   - Validar parámetros de entrada
   - Implementar límites de tasa (rate limiting)

### Rendimiento

1. **Optimización de Base de Datos**
   - Crear índices para consultas frecuentes
   - Optimizar consultas vectoriales
   - Monitorear y ajustar rendimiento

2. **Caché con Redis**
   - Cachear resultados de operaciones costosas
   - Implementar estrategias de invalidación de caché
   - Monitorear uso de memoria

3. **Optimización de LLM**
   - Ajustar parámetros de contexto y temperatura
   - Implementar técnicas de compresión de prompt
   - Cachear respuestas comunes

## Cómo iniciar el entorno

```bash
# Clonar el repositorio
git clone https://github.com/yourusername/chatree.git
cd chatree

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## Acceso a servicios

- Frontend: http://localhost:3000
- Supabase Studio: http://localhost:54323
- API de LangChain: http://localhost:5000/docs
- Redis Commander: http://localhost:8081

## Solución de problemas comunes

### CORS y autenticación

Si experimentas problemas de CORS al intentar acceder desde el frontend al backend de Supabase, verifica:

1. En `Server/supabase/.env` configura correctamente:
   ```
   SUPABASE_PUBLIC_SITE_URL=http://localhost:3000
   SUPABASE_EXTRA_HEADERS=Access-Control-Allow-Origin: http://localhost:3000
   ```

2. En `app/src/middleware.ts` asegúrate de tener configurados los headers CORS:
   ```typescript
   response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
   response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
   response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Info');
   response.headers.set('Access-Control-Allow-Credentials', 'true');
   ```

3. Para problemas de TypeScript con `redirectTo` o `emailRedirectTo`, añade la aserción de tipo `as string`:
   ```typescript
   options: {
     redirectTo: callbackUrl || `${window.location.origin}/dashboard/overview` as string
   }
   ```

4. Recuerda reiniciar los servicios después de cualquier cambio:
   ```bash
   cd Server/supabase && docker compose restart
   ```
