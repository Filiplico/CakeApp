# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Rene's Cakes** — a full-stack cake shop app. Customers browse cakes, design a custom cake in a live 3D builder (with an AI designer that draws text or pictures onto the cake), and place orders. A planned admin area will manage products and order statuses.

## Architecture

Two independent apps in the repo root:

- **[frontend/](frontend/)** — React 19 + Vite + TypeScript + React Router + three.js. Plain CSS (no UI framework). No state management library.
- **[backend/](backend/)** — Spring Boot 4 (Java 17), Spring Data JPA, Spring Security, Bean Validation, Anthropic Java SDK. PostgreSQL at runtime; tests use in-memory H2.

### Backend package structure (`com.renescakes.backend`)

```
controller/   REST endpoints
service/      business logic (CakeArtService calls Claude)
repository/   Spring Data JPA interfaces
model/        JPA entities (Product, Order, enums)
dto/          request bodies (OrderCreateRequest, CakeArtRequest)
config/       WebConfig (CORS), SecurityConfig, GlobalExceptionHandler
exception/    NotFoundException, CakeArtException
```

### Frontend routing ([frontend/src/App.tsx](frontend/src/App.tsx))

| Path | Component |
|------|-----------|
| `/` | Home |
| `/cakes` | Cakes |
| `/cakes/:id` | CakeDetails |
| `/contact` | Contact |
| `/custom-order` | CustomOrder — 3D cake builder, lazy-loaded (feature code in [frontend/src/cake-builder/](frontend/src/cake-builder/)) |

The catalogue pages load data from the API through `useApi` + [frontend/src/api.ts](frontend/src/api.ts).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/{id}` | Get product by id |
| POST | `/api/orders` | Create an order |
| POST | `/api/ai/cake-art` | AI cake designer: `{prompt, frostingColor}` → `{svg}`. Needs `ANTHROPIC_API_KEY` in the backend's environment |

Only these are public (see `SecurityConfig`); everything else requires auth. CORS in [WebConfig.java](backend/src/main/java/com/renescakes/backend/config/WebConfig.java) allows `http://localhost:5173`.

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
./mvnw test              # integration tests on H2, no Docker needed
./mvnw package           # build JAR
```

### Database

`docker compose up -d` starts PostgreSQL at `localhost:5433` (non-standard port), database `cakes`, user `cakes_user`, password `cakes_pass`. Seed data is in [data.sql](backend/src/main/resources/data.sql); it runs on every startup but only inserts into an empty `products` table.

## Data Models

**Product** fields: `id`, `name`, `category` (enum: BIRTHDAY/CELEBRATION/WEDDING/EVERYDAY/KIDS/CUPCAKES), `priceFrom` (Integer, cents), `imageUrl`, `shortDescription`, `fullDescription`.

**Order** fields: `id`, `customerName`, `phone`, `email`, `pickupOrDelivery`, `address`, `dateNeeded` (LocalDate), `notes`, `status` (enum: NEW/IN_PROGRESS/COMPLETED), `customizationJson` (TEXT, stores the cake builder design as JSON).
