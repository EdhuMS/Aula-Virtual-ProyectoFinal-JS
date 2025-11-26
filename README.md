# Aula Virtual - Plataforma de Gestión de Aprendizaje (LMS)

Aula Virtual es una plataforma educativa moderna y completa diseñada para facilitar la interacción entre administradores, profesores y estudiantes. Construida con tecnologías de vanguardia, ofrece una experiencia de usuario fluida y robusta para la gestión de cursos, tareas, evaluaciones y comunicación en tiempo real.

## 🚀 Características Principales

### 👥 Roles de Usuario
- **Administrador**: Gestión total de usuarios (crear, editar, eliminar), supervisión de cursos y aprobación de solicitudes de cambio de notas.
- **Profesor**: Creación y gestión de cursos, módulos, lecciones, tareas y exámenes. Calificación de entregas y retroalimentación.
- **Estudiante**: Inscripción en cursos, visualización de contenido, envío de tareas, realización de exámenes y consulta de calificaciones.

### 📚 Gestión Académica
- **Estructura de Cursos**: Organización jerárquica en Módulos -> Lecciones / Tareas / Exámenes.
- **Contenido Rico**: Soporte para lecciones con contenido multimedia y texto enriquecido.
- **Tareas**: Sistema de entrega de archivos (PDF, imágenes) con comentarios.
- **Exámenes**: Cuestionarios de opción múltiple con calificación automática y límites de tiempo.

### 💬 Comunicación y Notificaciones
- **Chat en Tiempo Real**: Mensajería instantánea entre estudiantes y profesores.
- **Notificaciones**: Alertas para nuevas solicitudes de corrección y mensajes no leídos.
- **Solicitudes de Corrección**: Flujo formal para que los profesores soliciten cambios en notas ya cerradas, requiriendo aprobación administrativa.

## 🛠️ Stack Tecnológico

Este proyecto utiliza una arquitectura moderna basada en **Next.js 15** (App Router):

- **Frontend**: React, Tailwind CSS 4.0, Lucide React (Iconos).
- **Backend**: Next.js Server Actions (API-less architecture).
- **Base de Datos**: MySQL (vía Prisma ORM).
- **Autenticación**: NextAuth.js (Credenciales).
- **Almacenamiento**: Cloudinary (para imágenes y archivos de tareas).
- **Lenguaje**: TypeScript.

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una estructura **Feature-First** y basada en roles:

```
app/
├── (auth)/                 # Rutas públicas de autenticación (Login)
├── (dashboard)/            # Rutas protegidas con Layout compartido
│   ├── admin/              # Panel de Administrador (Usuarios, Cursos, Solicitudes)
│   ├── teacher/            # Panel de Profesor (Gestión de Cursos, Calificaciones)
│   └── student/            # Panel de Estudiante (Mis Cursos, Aprendizaje)
├── api/                    # Route Handlers (NextAuth)
components/                 # Componentes reutilizables (UI, Layouts, Forms)
lib/                        # Configuraciones (Prisma, Auth, Utils)
actions/                    # Server Actions (Lógica de Negocio y BD)
prisma/                     # Esquema de Base de Datos y Seed
```

## 📋 Requisitos Previos

- **Node.js** (v18 o superior)
- **MySQL** (Base de datos local o remota, e.g., Aiven, PlanetScale)
- **Cuenta de Cloudinary** (para subida de archivos)

## ⚙️ Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/aula-virtual.git
    cd aula-virtual
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

    ```env
    DATABASE_URL="mysql://usuario:password@localhost:3306/aula_virtual"
    NEXTAUTH_SECRET="tu_secreto_super_seguro"
    NEXTAUTH_URL="http://localhost:3000"
    
    # Cloudinary
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu_cloud_name"
    CLOUDINARY_API_KEY="tu_api_key"
    CLOUDINARY_API_SECRET="tu_api_secret"
    ```

4.  **Configurar la Base de Datos:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Poblar la Base de Datos (Seed):**
    El proyecto incluye un script para crear usuarios y cursos de prueba.
    ```bash
    npx prisma db seed
    ```
    *Esto creará un admin, profesores, estudiantes y cursos de ejemplo.*

6.  **Iniciar el Servidor de Desarrollo:**
    ```bash
    npm run dev
    ```
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔑 Credenciales de Prueba (Seed)

| Rol | Email | Contraseña |
| :--- | :--- | :--- |
| **Admin** | `admin@aulavirtual.com` | `123456` |
| **Profesor** | `juan.perez@aulavirtual.com` | `123456` |
| **Estudiante** | `edhu@aulavirtual.com` | `123456` |

## 📖 Instrucciones de Uso

### Para Administradores
1.  Inicia sesión como Admin.
2.  Ve a "Gestionar Usuarios" para crear o editar cuentas.
3.  Ve a "Todos los Cursos" para reasignar profesores si es necesario.
4.  Revisa la sección de "Solicitudes" para aprobar cambios de notas.

### Para Profesores
1.  Inicia sesión como Profesor.
2.  En "Mis Cursos", selecciona un curso para editar su contenido.
3.  Crea Módulos, y dentro de ellos añade Lecciones, Tareas o Exámenes.
4.  En "Gestionar Tareas", califica las entregas de los estudiantes.
5.  Si necesitas cambiar una nota ya guardada, usa el botón de "Solicitar Corrección".

### Para Estudiantes
1.  Inicia sesión como Estudiante.
2.  En "Mi Aprendizaje", verás los cursos en los que estás inscrito.
3.  Entra a un curso para ver el contenido, subir tareas o tomar exámenes.
4.  Usa el Chat para comunicarte con tus compañeros y profesores.

## 📄 Licencia

Este proyecto es de uso educativo y privado.
