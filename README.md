# 🚀 CollabLearn Platform

**Plataforma de Aprendizaje Colaborativo en Tiempo Real**

Una plataforma completa de gestión de conocimiento y colaboración tipo Notion/Obsidian para equipos, con características empresariales avanzadas.

## ✨ Características Principales

### 🔐 Autenticación & Seguridad
- ✅ Sistema de autenticación JWT + Session
- ✅ OAuth 2.0 (Google, GitHub)
- ✅ Autenticación de dos factores (2FA/MFA con TOTP)
- ✅ Rate limiting y protección contra DDoS
- ✅ Encriptación end-to-end para datos sensibles
- ✅ Sistema de permisos granular (RBAC)

### 👥 Colaboración en Tiempo Real
- ✅ WebSockets para actualizaciones instantáneas
- ✅ Editor colaborativo en tiempo real (tipo Google Docs)
- ✅ Cursor presence (visualizar posición de otros usuarios)
- ✅ Sistema de comentarios y menciones
- ✅ Chat integrado por workspace
- ✅ Notificaciones push en tiempo real

### 📝 Gestión de Contenido
- ✅ Editor Markdown avanzado con preview
- ✅ Sistema de bloques modulares
- ✅ Organización jerárquica de páginas
- ✅ Templates personalizables
- ✅ Versionado y historial de cambios
- ✅ Papelera de reciclaje con restauración

### 🔍 Búsqueda & Organización
- ✅ Búsqueda full-text con Elasticsearch
- ✅ Filtros avanzados y facetas
- ✅ Tags y categorías
- ✅ Búsqueda global cross-workspace
- ✅ Búsqueda con autocompletado

### 📤 Importación/Exportación
- ✅ Upload de archivos (imágenes, PDFs, documentos)
- ✅ Procesamiento automático de imágenes
- ✅ Extracción de texto de PDFs
- ✅ Exportar a PDF, Markdown, HTML
- ✅ Exportar a Excel/CSV para datos tabulares
- ✅ API REST + GraphQL completa

### 🔔 Notificaciones & Webhooks
- ✅ Sistema de notificaciones en app
- ✅ Notificaciones por email
- ✅ Webhooks configurables
- ✅ Integración con servicios externos (Slack, Discord)

### 🤖 Inteligencia Artificial
- ✅ Recomendaciones de contenido con ML
- ✅ Análisis de sentimientos en comentarios
- ✅ Autocompletado inteligente
- ✅ Generación automática de resúmenes
- ✅ Sugerencias de tags automáticas

### 🌍 Internacionalización
- ✅ Soporte multiidioma (i18n)
- ✅ Detección automática de idioma
- ✅ Traducciones dinámicas

### 📊 Analytics & Reportes
- ✅ Dashboard de métricas
- ✅ Reportes de actividad
- ✅ Estadísticas de uso
- ✅ Exportación de reportes

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Real-time**: Socket.io Client
- **Editor**: TipTap (extensible rich text editor)
- **Forms**: React Hook Form + Zod

### Backend
- **Framework**: Next.js API Routes + tRPC
- **Runtime**: Node.js 20+
- **Type Safety**: TypeScript
- **API**: tRPC (Type-safe API), REST, GraphQL

### Base de Datos
- **Primary DB**: PostgreSQL 16
- **ORM**: Prisma
- **Cache**: Redis
- **Search**: Elasticsearch
- **File Storage**: S3-compatible (MinIO local/AWS S3 prod)

### Autenticación
- **Library**: NextAuth.js v5
- **Strategy**: JWT + Session
- **OAuth**: Google, GitHub
- **2FA**: speakeasy (TOTP)

### Real-time & WebSockets
- **Library**: Socket.io
- **Collaboration**: Yjs (CRDT for collaborative editing)
- **Presence**: Custom presence system

### AI & ML
- **NLP**: OpenAI API / Local models
- **Search**: Elasticsearch with ML
- **Recommendations**: TensorFlow.js

### DevOps & Testing
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Testing**: Jest + Vitest + Playwright
- **Linting**: ESLint + Prettier
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston + ELK Stack

## 📁 Estructura del Proyecto

```
CollabLearn_Platform/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   ├── components/    # React components
│   │   │   ├── lib/          # Utilities
│   │   │   └── trpc/         # tRPC client
│   │   └── public/
│   └── api/                    # Backend services
│       ├── src/
│       │   ├── routers/       # tRPC routers
│       │   ├── services/      # Business logic
│       │   └── middleware/    # Auth, rate limit, etc.
│       └── prisma/
├── packages/
│   ├── database/              # Prisma schema
│   ├── ui/                    # Shared UI components
│   ├── typescript-config/     # Shared TS configs
│   └── eslint-config/         # Shared ESLint configs
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.web
│   └── Dockerfile.api
├── .github/
│   └── workflows/             # CI/CD pipelines
└── docs/                      # Documentación
```

## 🚀 Getting Started

### Prerequisitos
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7
- Elasticsearch 8

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/jalbraton/CollabLearn_Platform.git
cd CollabLearn_Platform

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Levantar servicios con Docker
docker-compose up -d

# Ejecutar migraciones
npm run db:migrate

# Seed de datos (opcional)
npm run db:seed

# Iniciar desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📚 Documentación

- [Arquitectura del Sistema](./docs/ARCHITECTURE.md)
- [Guía de Contribución](./docs/CONTRIBUTING.md)
- [API Documentation](./docs/API.md)
- [Security Guidelines](./docs/SECURITY.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:integration

# Tests E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📦 Build & Deploy

```bash
# Build para producción
npm run build

# Iniciar en producción
npm run start

# Deploy con Docker
docker-compose -f docker-compose.prod.yml up -d
```

## 🔒 Seguridad

Este proyecto implementa múltiples capas de seguridad:
- Autenticación robusta con JWT
- Rate limiting
- CORS configurado
- SQL injection prevention (Prisma)
- XSS protection
- CSRF tokens
- Encriptación de datos sensibles

Ver [SECURITY.md](./docs/SECURITY.md) para más detalles.

## 📄 Licencia

**© 2025 - Todos los derechos reservados**

Este proyecto está bajo una licencia restrictiva. Ver [LICENSE](../LICENSE) para más detalles.

### Uso Permitido:
- ✅ Uso personal
- ✅ Estudio del código
- ✅ Reportar bugs

### Uso Prohibido:
- ❌ Modificación del código
- ❌ Distribución
- ❌ Uso comercial sin autorización

**Atribución requerida** en cualquier uso o referencia del código.

## 👤 Autor

Desarrollador Full-Stack
- GitHub: [@jalbraton](https://github.com/jalbraton)
- Portfolio: [Proyectos Personales](https://github.com/jalbraton/Proyectos_personales_)

## 🤝 Contribuciones

Este es un proyecto personal de portfolio. Sin embargo, se agradecen:
- 🐛 Reportes de bugs
- 💡 Sugerencias de mejoras
- ⭐ Estrellas en GitHub

---

⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub
