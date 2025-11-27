# Diseño de Arquitectura y Estrategia Técnica

Este documento detalla las decisiones de arquitectura, la estructura del proyecto y los patrones de diseño utilizados en **Aula Virtual**. El objetivo es proporcionar una visión técnica profunda para desarrolladores y arquitectos.

## 1. Stack Tecnológico y Decisiones Clave

### Frontend: Next.js 15 (App Router)
-   **Razón**: Aprovechamiento de **React Server Components (RSC)** para reducir el JavaScript enviado al cliente y mejorar el SEO y la carga inicial.
-   **Routing**: Sistema de rutas basado en carpetas (`app/`) para una estructura intuitiva y anidada.
-   **Styling**: **Tailwind CSS 4.0** para un desarrollo rápido, consistente y con un bundle size mínimo.

### Backend: Server Actions
-   **Arquitectura**: "API-less". No exponemos una API REST tradicional separada.
-   **Razón**: Las Server Actions permiten llamar a funciones del servidor directamente desde componentes del cliente (o servidor), simplificando la gestión de datos y eliminando la necesidad de capas de fetch/axios manuales y endpoints intermedios.
-   **Seguridad**: Validación de inputs con Zod (implícito o explícito) y verificación de sesión en cada acción.

### Base de Datos: PostgreSQL + Prisma ORM
-   **Prisma**: Proporciona un tipado estático fuerte (TypeScript) desde la base de datos hasta el frontend, reduciendo errores en tiempo de ejecución.
-   **Esquema**: Relacional, optimizado para la integridad de datos (Usuarios, Cursos, Inscripciones, Entregas).

### Autenticación: NextAuth.js (v4/v5)
-   **Estrategia**: JWT (JSON Web Tokens).
-   **Provider**: Credenciales (Email/Password) con hashing seguro (bcrypt).
-   **Middleware**: Protección de rutas a nivel de servidor (Edge Middleware) para redirigir usuarios no autorizados antes de renderizar la página.

### Almacenamiento: Cloudinary
-   **Estrategia**: Carga directa desde el cliente (Signed Uploads).
-   **Flujo**:
    1.  Cliente solicita firma al servidor.
    2.  Servidor valida permisos y devuelve firma.
    3.  Cliente sube archivo directamente a Cloudinary (evitando carga en nuestro servidor).
    4.  Cliente envía la URL resultante a nuestro servidor para guardarla en BD.

## 2. Estructura de Carpetas (Feature-First & Role-Based)

La estructura está diseñada para escalar y separar responsabilidades claramente.

```
e:/UTP/CICLO 6/JavaScript Avanzado/Aula Virtual/
├── actions/                # Lógica de Negocio (Server Actions)
│   ├── auth-actions.ts     # Login, Registro
│   ├── course-actions.ts   # CRUD Cursos
│   ├── user-actions.ts     # Gestión Usuarios
│   └── ...
│
├── app/                    # Rutas de la Aplicación (Next.js App Router)
│   ├── (auth)/             # Grupo de rutas públicas (sin layout de dashboard)
│   ├── (dashboard)/        # Grupo de rutas protegidas (con Sidebar/Navbar)
│   │   ├── admin/          # Vistas exclusivas de Administrador
│   │   ├── teacher/        # Vistas exclusivas de Profesor
│   │   ├── student/        # Vistas exclusivas de Estudiante
│   │   ├── chat/           # Funcionalidad transversal
│   │   └── profile/        # Gestión de perfil usuario
│   └── api/                # Route Handlers (solo para Auth y Webhooks si fuera necesario)
│
├── components/             # Componentes de UI
│   ├── ui/                 # Componentes base (Botones, Modales, Inputs, SearchableSelect) - Design System
│   ├── student/            # Componentes específicos de vista estudiante
│   ├── teacher/            # Componentes específicos de vista profesor
│   └── ...
│
├── lib/                    # Utilidades y Configuración
│   ├── prisma.ts           # Singleton de conexión a BD
│   ├── auth.ts             # Configuración de NextAuth
│   └── utils.ts            # Helpers generales
│
├── prisma/                 # Base de Datos
│   ├── schema.prisma       # Definición del modelo de datos
│   └── seed.ts             # Datos de prueba iniciales
│
└── public/                 # Assets estáticos
```

## 3. Patrones de Diseño Implementados

### Container/Presentational Pattern (Adaptado)
-   **Page Components (`page.tsx`)**: Actúan como "Contenedores". Son Server Components que obtienen datos (vía Server Actions o Prisma directo) y los pasan a componentes cliente.
-   **Client Components (`*-client.tsx`)**: Actúan como "Presentacionales" e interactivos. Manejan el estado (useState), efectos (useEffect) y eventos de usuario.

### Composition
-   Uso extensivo de `children` prop y componentes pequeños reutilizables (`SubmitButton`, `Modal`) para evitar "Prop Drilling" y componentes monolíticos.

### Optimistic UI
-   Uso de `useOptimistic` (donde aplica) o actualización de estado local inmediata antes de revalidar datos del servidor, para una experiencia de usuario instantánea.

### Polling para Tiempo Real (Chat)
-   Implementación de un sistema de sondeo (polling) eficiente en `ChatClient` y `DashboardLayout` para simular tiempo real sin la complejidad de WebSockets, adecuado para la escala actual.

## 4. Flujo de Datos Típico

1.  **Usuario** interactúa con la UI (ej. "Crear Curso").
2.  **Client Component** invoca una **Server Action** (`createCourse`).
3.  **Server Action**:
    *   Verifica autenticación (`auth()`).
    *   Valida datos de entrada.
    *   Ejecuta operación en BD (`prisma.course.create`).
    *   Revalida el caché de Next.js (`revalidatePath`).
    *   Retorna resultado o error.
4.  **Client Component** recibe respuesta y actualiza UI (o redirige).

## 5. Seguridad

-   **Rutas**: Protegidas por Middleware (`middleware.ts`) que verifica el token JWT y el rol del usuario (`ADMIN`, `TEACHER`, `STUDENT`).
-   **Datos**: Las Server Actions vuelven a verificar la sesión y permisos antes de ejecutar cualquier mutación, asegurando que un usuario no pueda saltarse la seguridad del frontend.
-   **Archivos**: Las firmas de Cloudinary se generan solo para usuarios autenticados.

## 6. Escalabilidad Futura

-   **Base de Datos**: El esquema relacional permite fácil migración a servicios gestionados (AWS RDS, Supabase).
-   **Real-time**: El sistema de polling puede reemplazarse por Pusher o Socket.io si la carga aumenta significativamente, sin reescribir la lógica de negocio.
-   **Internacionalización**: La estructura actual permite fácil integración de `next-intl` si se requiere soporte multi-idioma real (más allá de los textos hardcoded).
