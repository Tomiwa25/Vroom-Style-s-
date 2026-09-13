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
CLIENT_URL=http://localhost:5173
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

This project is currently separated into a backend Express/Prisma service and a frontend Vite service. For production hosting such as Render:

- Deploy the backend service from the `server` folder.
- Deploy the frontend service from the `client` folder.
- Set the frontend environment variable `VITE_API_URL` to the deployed backend route root.
- Set backend environment variables for `DATABASE_URL`, `JWT_SECRET`, `PAYSTACK_SECRET_KEY`, and `CLIENT_URL`.

## Status

The repository has a working route structure and full backend API design for a simple clothing/accessories e-commerce workflow. The frontend has a visual storefront and customer login/register mockup, but the UI is not fully connected to live API data yet.
