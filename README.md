# Vroom Style(s) E-Commerce Platform

Vroom Style(s) is a full-stack clothing and accessories e-commerce project with a TypeScript Express API, Prisma PostgreSQL data layer, and a Vite React frontend.

## Project Structure

```text
client/        React + Vite frontend
server/        Express + Prisma backend
```

## Backend

The backend uses Express and Prisma. Main files are organized in the server source tree:

- App bootstrap: `server/src/app.ts`
- Server startup: `server/src/server.ts`
- Prisma database config: `server/src/config/database.ts`
- Authentication middleware: `server/src/middleware/auth.middleware.ts`
- Role middleware: `server/src/middleware/role.middleware.ts`

## Current API Routes

### Health

- `GET /api/health`

### Products

- `GET /api/products`
- `GET /api/products/search`
- `GET /api/products/:id`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/currentUser`

### Cart

- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:id`
- `DELETE /api/cart/items/:id`

### Orders

- `POST /api/orders`
- `GET /api/orders`

### Payments

- `POST /api/payments/webhook`
- `POST /api/payments/initialize`
- `POST /api/payments/verify`

### Admin

- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `PATCH /api/admin/products/:id/stock`
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:id/status`
- `GET /api/admin/stats`
- `GET /api/admin/dashboard`

## Frontend

The client uses Vite + React + TypeScript + Axios.

- Client development package: `client/package.json`
- Axios base client: `client/src/services/api.ts`
- Main UI screen: `client/src/App.tsx`
- Styling: `client/src/styles.css`

The frontend currently includes a landing/storefront-style UI with:

- Top navigation
- Hero section
- Collection strip
- Product card grid
- Feature editorial band
- Customer login/register panel
- Admin/store summary card

## Environment

The backend environment template is in:

- `server/.env example`

Typical variables:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/postgres?connect_timeout=10&sslmode=prefer"
JWT_SECRET=
PAYSTACK_SECRET_KEY=
CLIENT_URL=https://vroom-style-s.vercel.app
CORS_ORIGIN=https://vroom-style-s.vercel.app
```

## Development Commands

### Server

```bash
cd server
npm install
npm run build
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```

## Deployment Notes

This project is separated into a backend Express/Prisma service and a frontend Vite service:

- **Frontend**: Hosted on [Vercel](https://vroom-style-s.vercel.app)
- **Backend API**: Hosted on [Render](https://vroom-styles.onrender.com/api)
- Frontend Environment Variables: `VITE_API_URL=https://vroom-styles.onrender.com/api`
- Backend Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `PAYSTACK_SECRET_KEY`, `CLIENT_URL`, `CORS_ORIGIN`

## CI/CD Pipeline (GitHub Actions)

An automated CI/CD pipeline is configured in [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) with three automated stages:

1. **Client CI (`client-ci`)**:
   - Node.js 20 with npm caching
   - Automated ESLint code linting (`npm run lint`)
   - Production Vite bundle build (`npm run build`)
2. **Server CI (`server-ci`)**:
   - Node.js 20 with npm caching
   - Ephemeral PostgreSQL 16 test service container
   - Prisma Client generation (`npx prisma generate`)
   - TypeScript compilation (`npm run build`)
   - Database migration push (`npx prisma db push`)
   - Integration & unit test suite execution with Vitest (`npm run test:run`)
3. **Continuous Deployment (`deploy`)**:
   - Triggers automatically upon merges or pushes to `main` when CI passes, or manually via `workflow_dispatch`
   - Invokes the Render Deploy Hook to immediately trigger backend redeployment
   - Invokes the Vercel Deploy Hook (or leverages Vercel native GitHub integration)
   - Emits a deployment report directly to GitHub Actions Summary

### Configuring CI/CD Secrets in GitHub

To enable automated CD redeployment hooks, add these repository secrets in GitHub (`Settings -> Secrets and variables -> Actions`):

| Secret Name | Description | Where to find |
| :--- | :--- | :--- |
| `RENDER_DEPLOY_HOOK_URL` | Render Deploy Hook URL | Render Dashboard → Backend Service → Settings → Deploy Hook |
| `VERCEL_DEPLOY_HOOK_URL` *(Optional)* | Vercel Deploy Hook URL | Vercel Dashboard → Project → Settings → Git → Deploy Hooks |

## Status

The repository has a working route structure and full backend API design for a clothing/accessories e-commerce workflow. The frontend has a visual storefront and customer login/register mockup, ready for live API integration.
