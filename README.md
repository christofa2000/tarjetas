# 💳 Credit Cards Lab

Demo estilo banca digital construida con Next.js, que simula un dashboard de tarjetas de crédito, autenticación falsa y un modal protegido por token para revelar datos sensibles.

## ✨ Highlights

- 🔐 **Auth simulada** vía rutas en `app/api/auth/*`, cookies httpOnly y un store de Zustand persistente
- ♻️ **Axios interceptors** renuevan el token automáticamente y reintentan requests en caso de 401
- 💳 **Dashboard card** con detección de marca, validación Luhn y máscara de datos con modal de revelado
- ⏳ **Modal protegido** solo acepta el token temporal `123456` y oculta los datos después de 30s
- 🎨 **Tailwind CSS 4** con gradiente cálido y estilos reutilizables para botones/cards
- ✅ **Arquitectura modular** con separación de concerns (auth, API, utils, hooks)
- 🧪 **Tests unitarios** completos (34 tests pasando)
- 🎯 **Error handling** centralizado y tipado estricto

## 🛠 Tech Stack

- ⚡ **Next.js 15** (App Router)
- ⚛️ **React 19** + **TypeScript 5** (strict mode)
- 🎨 **Tailwind CSS 4**
- 📦 **Zustand** (gestión de estado)
- 📝 **React Hook Form** + **Zod** (validación)
- 🌐 **Axios** (HTTP client con interceptors)
- 🧪 **Jest** + **Testing Library** (testing)

## 📋 Prerequisitos

- 🟢 **Node.js 18+** (recomendado: 20 LTS)
- 📦 **npm 9+** (o tu gestor preferido)

## ⚙️ Variables de Entorno

Crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_API_BASE=http://localhost:3000
JWT_EXPIRES_IN_SEC=180
REFRESH_EXPIRES_IN_SEC=86400
```

- `NEXT_PUBLIC_API_BASE` → apunta al mismo servidor Next.js en modo demo
- `JWT_EXPIRES_IN_SEC` → tiempo de vida del token en segundos
- `REFRESH_EXPIRES_IN_SEC` → TTL del token de refresh

## 🚀 Getting Started

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abre http://localhost:3000
# Logueate con cualquier email y password
# En el dashboard, presiona "Mostrar datos" e ingresa 123456
```

## 📜 Scripts Disponibles

| Command                 | Descripción                                   |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Inicia el servidor en modo dev con hot reload |
| `npm run build`         | Build de producción + lint + type check       |
| `npm run start`         | Sirve el build de producción                  |
| `npm run lint`          | Corre ESLint con la config de Next.js         |
| `npm run lint:fix`      | Corre ESLint y aplica fixes automáticos       |
| `npm run typecheck`     | Ejecuta `tsc --noEmit`                        |
| `npm run format`        | Formatea código con Prettier                  |
| `npm run format:check`  | Verifica formato sin modificar archivos       |
| `npm run test`          | Corre Jest test suite                         |
| `npm run test:watch`    | Jest en modo watch                            |
| `npm run test:coverage` | Jest con reporte de cobertura                 |
| `npm run validate`      | Ejecuta typecheck + lint + format:check       |

## 📂 Estructura del Proyecto

```
tarjetas/
├── app/                      # App Router (Next.js 15)
│   ├── api/                 # API Routes
│   │   ├── auth/            # Endpoints de autenticación
│   │   └── ...
│   ├── dashboard/           # Página del dashboard
│   ├── login/               # Página de login
│   └── layout.tsx           # Layout raíz
├── components/              # Componentes React
│   ├── cards/              # Componentes de tarjetas
│   │   ├── CreditCardItem.tsx
│   │   └── ValidationModal.tsx
│   └── ui/                 # Componentes UI reutilizables
├── lib/                    # Lógica de negocio y utilidades
│   ├── api/                # Cliente HTTP y endpoints
│   │   └── client.ts       # Instancia de Axios con interceptors
│   ├── auth/               # Autenticación
│   │   ├── store.ts        # Store de Zustand
│   │   ├── token.ts        # Utilidades de tokens
│   │   ├── types.ts        # Types de auth
│   │   └── index.ts        # Barrel exports
│   ├── utils/               # Utilidades generales
│   │   ├── cardUtils.ts    # Validación Luhn, detección de marca
│   │   ├── errorHandler.ts # Manejo centralizado de errores
│   │   └── index.ts        # Barrel exports
│   ├── hooks/              # Hooks personalizados
│   │   └── useAuth.ts      # Hook de autenticación
│   └── constants/          # Constantes globales
│       └── app.ts          # Configuración de la app
├── middleware.ts           # Middleware de Next.js (protección de rutas)
└── __tests__/              # Tests unitarios
    ├── lib/
    ├── components/
    └── ...
```

## 🔑 Flujo de Autenticación

1. 🔑 **Login** → `POST /api/auth/login` → devuelve usuario demo + tokens
2. 📦 **Tokens** → se guardan en cookies httpOnly + localStorage (rehidratación de sesión)
3. ♻️ **Axios interceptors** → agregan `Authorization` header y refrescan token automáticamente si está cerca de expirar (<30s)
4. ❌ **Si el refresh falla** → se limpian tokens y se redirige al login

## 💳 Card Reveal Token

El modal de validación implementa:

- 🔒 **Validación de token**: solo acepta el código `123456` (configurable vía `NEXT_PUBLIC_VALIDATION_TOKEN`)
- ⏳ **Countdown**: deshabilita el formulario al expirar y se resetea al cerrar
- 🔒 **Auto-ocultado**: los campos sensibles se ocultan automáticamente después de 30 segundos
- ♿ **Accesibilidad**: focus trap, soporte de teclado (Escape, Tab), `aria-live` para actualizaciones

## 🧪 Testing

El proyecto incluye tests unitarios completos:

```bash
# Ejecutar todos los tests
npm test

# Modo watch
npm test:watch

# Con cobertura
npm test:coverage
```

**Cobertura actual:**

- ✅ `cardUtils` - Validación Luhn y detección de marca (18 tests)
- ✅ `authStore` - Login y logout (5 tests)
- ✅ `CreditCardItem` - Componente de tarjeta (11 tests)
- ✅ `login` - Formulario de login (1 test)

**Total: 34 tests pasando**

## ✅ Quality Checks

Antes de hacer commit, ejecuta:

```bash
npm run validate
```

Este comando ejecuta:

- ✅ Type checking (`tsc --noEmit`)
- ✅ Linting (`next lint`)
- ✅ Formato (`prettier --check`)

## 🎯 Características Implementadas

### ✅ Arquitectura

- [x] Estructura modular en `lib/` (auth, api, utils, hooks)
- [x] Separación de concerns (UI, lógica, estado global)
- [x] Barrel exports para imports limpios
- [x] Tipos centralizados

### ✅ Calidad de Código

- [x] TypeScript strict mode
- [x] Prettier configurado
- [x] ESLint con Next.js config
- [x] Constantes centralizadas (sin magic numbers)
- [x] Error handling centralizado
- [x] Sin `console.log` en producción

### ✅ Rendimiento

- [x] Hooks personalizados optimizados
- [x] Selectores específicos de Zustand
- [x] Dynamic imports con lazy loading

### ✅ Accesibilidad

- [x] Focus trap en modales
- [x] Soporte de teclado (Escape, Tab)
- [x] `aria-live` para actualizaciones dinámicas
- [x] `aria-label` y `aria-describedby` en formularios

### ✅ Testing

- [x] Tests unitarios para utilidades
- [x] Tests para componentes
- [x] Tests para store de Zustand
- [x] Jest configurado con Testing Library

## 🚧 Próximos Pasos

- 🏦 Completar pantallas de Cards y Transactions con datos reales o mocks
- 🎭 Integrar MSW para mockear APIs en tests
- 📊 Agregar tests E2E con Playwright
- 🎨 Mejorar design tokens en Tailwind (colores, spacing)
- 📈 Agregar analytics y monitoring de performance

## 📝 Notas

- Los tokens son demo y se generan automáticamente
- El token de validación del modal es `123456` (configurable)
- Los datos sensibles se ocultan automáticamente después de 30 segundos
- El proyecto usa arquitectura moderna con separación clara de responsabilidades

---

**Desarrollado con ❤️ usando Next.js 15 y TypeScript**
