# Mom's Cake Studio

A full-stack web app for a family cake business. Customers browse the cakes, design their own cake in a live 3D builder, and place an order. An AI designer draws whatever the customer types (a message or a picture) onto the cake.

The app is two independent projects in one repository:

| Folder | What it is |
|---|---|
| [`frontend/`](frontend/) | React 19 + TypeScript + Vite website, with the 3D cake builder in three.js |
| [`backend/`](backend/) | Spring Boot 4 (Java 17) REST API with PostgreSQL |
| [`prototype-nextjs/`](prototype-nextjs/) | An earlier Next.js prototype, kept for reference only and not used |

## Features

### Website
- Home page, cake catalogue, cake detail pages and a contact page
- Responsive layout for desktop and phone

### Custom order: 3D cake builder (`/custom-order`)
The customer sees a 3D cake on the left that updates with every choice on the right. They can drag to turn it.

1. **Design**
   - 1 to 4 tiers (the page opens on a plain white 3-tier cake)
   - A frosting colour for each tier, from presets or a custom colour picker
   - **Toppings:** candles, stars, hearts, clouds, roses and balls. Each topping has its own colour and can be placed on any combination of tiers.
   - **Decorations:** pearl border, ribbon, sprinkles (one colour or rainbow) and sugar roses, each in a colour of the customer's choice
   - **On the cake (AI):** the customer describes a message or a picture, and the AI designer draws it on the front of the cake. If the AI is not available, the words are piped on in icing lettering instead.
2. **Flavour:** the cake is cut in half to show the inside. Choosing a sponge (vanilla, chocolate, red velvet, lemon, pistachio, carrot) and a filling recolours the layers live.
3. **Details:** name, phone, optional email, date needed, pick up or delivery (with address) and notes.
4. **Order placed:** the cake is packed into a box with a ribbon and bow, and the customer sees their order number.

The full design is saved with the order as JSON (`customizationJson`), so the bakery can see exactly what was chosen.

## What you need installed

| Tool | Version | Used for |
|---|---|---|
| [Node.js](https://nodejs.org/) | 20.19 or newer (22 LTS recommended) | The frontend |
| [Java JDK](https://adoptium.net/) | 17 or newer | The backend (the Maven wrapper is included, so Maven itself is not needed) |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Any recent version | Running PostgreSQL |
| An [Anthropic API key](https://console.anthropic.com/) | | Optional. Only needed for the AI designer. |

## Running the app locally

You need three things running: the database, the backend and the frontend. Start them in this order, each in its own terminal, from the repository root.

### 1. Start the database

```bash
docker compose up -d
```

This starts PostgreSQL 16 in a container called `cakes-postgres`, with the data kept in a Docker volume:

| Setting | Value |
|---|---|
| Host and port | `localhost:5433` (not the usual 5432, so it does not clash with a local Postgres) |
| Database | `cakes` |
| User / password | `cakes_user` / `cakes_pass` |

To stop it: `docker compose down`. Add `-v` to also delete the data.

### 2. Start the backend

Set your Anthropic API key first if you want the AI designer to work. Without it, everything else still works and the cake builder falls back to icing lettering.

macOS / Linux / Git Bash:
```bash
export ANTHROPIC_API_KEY=your-key-here
cd backend
./mvnw spring-boot:run
```

Windows PowerShell:
```powershell
$env:ANTHROPIC_API_KEY = "your-key-here"
cd backend
.\mvnw.cmd spring-boot:run
```

The API runs at **http://localhost:8080**. On startup the tables are created automatically and the sample cakes from [`data.sql`](backend/src/main/resources/data.sql) are inserted.

> Never put the API key in `application.properties` or commit it. The backend only reads it from the environment.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The cake builder is at **http://localhost:5173/custom-order**.

The frontend expects the API at `http://localhost:8080`. To point it somewhere else, create `frontend/.env.local` with:

```
VITE_API_URL=https://your-api.example.com
```

## Configuration

Backend settings are in [`backend/src/main/resources/application.properties`](backend/src/main/resources/application.properties).

| Setting | Default | Meaning |
|---|---|---|
| `server.port` | `8080` | Port the API listens on |
| `spring.datasource.url` / `username` / `password` | The Docker database above | Database connection |
| `anthropic.model` | `claude-opus-5-5` | Claude model used by the AI designer |
| `ANTHROPIC_API_KEY` (environment variable) | not set | Key for the AI designer |

The browser is only allowed to call the API from `http://localhost:5173`. If the frontend is served from another address, add it in [`WebConfig.java`](backend/src/main/java/com/renescakes/backend/config/WebConfig.java).

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/products` | List all cakes |
| GET | `/api/products/{id}` | One cake by id |
| POST | `/api/orders` | Place an order |
| POST | `/api/ai/cake-art` | AI designer: turns a description into an SVG drawing for the cake |

These four endpoints are public. Every other path requires authentication (see [`SecurityConfig.java`](backend/src/main/java/com/renescakes/backend/config/SecurityConfig.java)), ready for the admin area.

**Place an order**

```http
POST /api/orders
Content-Type: application/json

{
  "customerName": "Anna Smith",
  "phone": "070 123 456",
  "email": "anna@example.com",
  "pickupOrDelivery": "PICKUP",
  "address": null,
  "dateNeeded": "2026-12-20",
  "notes": "No nuts please",
  "customizationJson": "{\"tiers\":3, ...}"
}
```

`customerName`, `phone`, `pickupOrDelivery` and `dateNeeded` (format `yyyy-MM-dd`) are required. New orders start with status `NEW`. Invalid requests return `400` with the problem fields listed under `errors`.

**AI designer**

```http
POST /api/ai/cake-art
Content-Type: application/json

{ "prompt": "Happy 30th Anna, with little gold stars", "frostingColor": "#ffffff" }
```

Returns `{ "svg": "<svg ...>...</svg>" }`. The prompt can be up to 200 characters. Errors:

| Status | Meaning |
|---|---|
| `422` | The request is not suitable for a cake |
| `503` | The AI is not configured (no API key) or not reachable |
| `502` | The AI answered with something that is not a usable drawing |

The frontend sanitises the returned SVG before drawing it on the cake.

## Data model

**Product:** `id`, `name`, `category` (`BIRTHDAY`, `WEDDING`, `KIDS`, `CUPCAKES`), `priceFrom` (in cents), `imageUrl`, `shortDescription`, `fullDescription`

**Order:** `id`, `customerName`, `phone`, `email`, `pickupOrDelivery`, `address`, `dateNeeded`, `notes`, `status` (`NEW`, `IN_PROGRESS`, `COMPLETED`), `customizationJson`

## Useful commands

| Where | Command | What it does |
|---|---|---|
| `frontend/` | `npm run dev` | Development server with hot reload |
| `frontend/` | `npm run build` | Type-check and build for production into `dist/` |
| `frontend/` | `npm run lint` | Run ESLint |
| `backend/` | `./mvnw spring-boot:run` | Run the API |
| `backend/` | `./mvnw test` | Run the tests |
| `backend/` | `./mvnw package` | Build a runnable JAR into `target/` |

## Project structure

```
frontend/src/
  pages/            One component per route (Home, Cakes, CakeDetails, Contact, CustomOrder)
  components/       Navbar, Footer, CakeCard, CakeCanvas (mounts the 3D scene) ...
  cake/             The 3D cake builder
    options.ts      Every option the customer can pick, and the defaults
    CakeScene.ts    The three.js scene: cake, toppings, cutting open, boxing animation
    textures.ts     Cake cross-section, icing lettering and SVG handling
  api.ts            Calls to the backend
  data/cakes.ts     Mock cake data still used by the catalogue pages
  styles/           Global styles and the cake builder styles

backend/src/main/java/com/renescakes/backend/
  controller/       REST endpoints
  service/          Business logic, including CakeArtService (the AI designer)
  repository/       Spring Data JPA repositories
  model/            Database entities
  dto/              Request bodies
  config/           CORS, security and error handling
  exception/        Custom exceptions
```

## Known issues

- **`npm run build` fails** because of type errors in `Cakes.tsx` and `Contact.tsx` (a `useFadeIn` ref typed for the wrong element). `npm run dev` is not affected.
- **Sample cakes are inserted again on every backend restart**, because `data.sql` runs on each startup. Reset the database with `docker compose down -v` if the list fills up with duplicates.
- **The catalogue pages still use mock data** from `frontend/src/data/cakes.ts` instead of `GET /api/products`.
- **The AI endpoint is public and every call costs money.** Add rate limiting before putting the app online.

## Planned

- Admin dashboard: log in, view orders and their saved cake design, change order status, manage products
- Load the catalogue from the API instead of mock data
