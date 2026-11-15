# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mom's Cake Studio** — a full-stack cake shop app. Customers browse cakes, submit custom orders, and (planned) use an AI design assistant. The admin manages products and order statuses.

## Architecture

Two independent apps in the repo root:

- **[frontend/](frontend/)** — React 19 + Vite + TypeScript + React Router. Plain CSS (no UI framework). No state management library.
- **[backend/](backend/)** — Spring Boot 4 (Java 17), Spring Data JPA, Spring Security, Lombok. PostgreSQL in production, H2 available for testing.

The `prototype-nextjs/` directory is an archived Next.js spike — not active.

### Backend package structure (`com.renescakes.backend`)

```
controller/   REST endpoints
service/      business logic
repository/   Spring Data JPA interfaces
model/        JPA entities (Product, Order, enums)
dto/          request bodies (e.g. OrderCreateRequest)
config/       WebConfig (CORS), GlobalExceptionHandler
exception/    NotFoundException
```

### Frontend routing ([frontend/src/App.tsx](frontend/src/App.tsx))

| Path | Component |
|------|-----------|
| `/` | Home |
| `/cakes` | Cakes |
| `/cakes/:id` | CakeDetails |
| `/contact` | Contact |
| `/custom-order` | CustomOrder — 3D cake builder (three.js scene in [frontend/src/cake/](frontend/src/cake/)) |

### Key data gap

The frontend currently reads from a static mock array in [frontend/src/data/cakes.ts](frontend/src/data/cakes.ts). The backend exposes real data via `GET /api/products` and `GET /api/products/{id}`. The frontend pages have not been wired to the API yet.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/{id}` | Get product by id |
| POST | `/api/orders` | Create an order |
| POST | `/api/ai/cake-art` | AI cake designer: `{prompt, frostingColor}` → `{svg}` drawn on the 3D cake. Needs `ANTHROPIC_API_KEY` in the backend's environment |

CORS is configured in [WebConfig.java](backend/src/main/java/com/renescakes/backend/config/WebConfig.java) to allow `http://localhost:5173`.

## Development Commands

### Frontend

```bash
cd frontend
npm install        # first time
npm run dev        # dev server → http://localhost:5173
npm run build      # tsc + vite build
npm run lint       # eslint
```

### Backend

```bash
cd backend
./mvnw spring-boot:run   # runs on :8080
./mvnw test              # run all tests
./mvnw package           # build JAR
```

### Database

The backend expects PostgreSQL at `localhost:5433` (non-standard port), database `cakes`, user `cakes_user`, password `cakes_pass`. See [application.properties](backend/src/main/resources/application.properties). Seed data is in [data.sql](backend/src/main/resources/data.sql) and runs on every startup (`spring.sql.init.mode=always`).

## Data Models

**Product** fields: `id`, `name`, `category` (enum: BIRTHDAY/WEDDING/KIDS/CUPCAKES), `priceFrom` (Integer, cents), `imageUrl`, `shortDescription`, `fullDescription`.

**Order** fields: `id`, `customerName`, `phone`, `email`, `pickupOrDelivery`, `address`, `dateNeeded` (LocalDate), `notes`, `status` (enum: NEW/IN_PROGRESS/COMPLETED), `customizationJson` (TEXT, stores cake configurator output as JSON).
