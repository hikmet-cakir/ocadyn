# OCADYN

**Smart price tracking for e-commerce products — paste a URL, set alert rules, and get notified when prices move.**

OCADYN is a full-stack price monitoring platform. Registered users track products from supported marketplaces, configure notification rules (threshold alerts and scheduled digests), and manage everything from a web dashboard. A background scheduler re-scrapes product pages, updates price history, and delivers in-app and email notifications when user-defined conditions are met.

---

## Overview

### What it does

OCADYN lets shoppers monitor product prices across multiple online stores from a single account. After signing in, a user pastes a product URL; the platform scrapes the page, stores product metadata and the current price, and begins periodic price checks. When prices change in ways that match the user's rules — or when a scheduled digest is due — the system creates in-app notifications and optionally sends HTML email alerts.

### Problem it solves

Manually checking product pages across Amazon, Trendyol, N11, Walmart, and other stores is repetitive and easy to miss. OCADYN centralizes tracking, keeps daily price history, surfaces savings analytics, and automates alerts so users can buy at the right time.

### Target users

- Online shoppers who want price-drop alerts
- Deal hunters tracking multiple products across marketplaces
- Developers extending or operating a self-hosted price-tracking stack

### Key capabilities

- User registration, login, and JWT-based sessions
- Product tracking by URL with marketplace-specific HTML parsing
- Configurable notification channels (push/in-app required; email optional)
- Threshold triggers (percent/fixed drop or rise) and periodic price digests
- Dashboard with stats, favorites, notification inbox, and savings reports
- Price history charts and 12-month drop analytics
- English and Turkish UI (i18n)
- Docker Compose deployment with nginx API gateway

---

## Features

### User-facing

| Feature | Description |
|---------|-------------|
| Product URL tracking | Paste a supported marketplace URL to add a product |
| Instant preview | Title, image, price, and marketplace shown after scrape |
| Watchlist management | List, search, pause/resume, and favorite tracked products |
| Notification inbox | View, filter, and mark price alerts as read |
| Alert configuration | Percent/fixed drop & rise triggers; hourly → weekly check frequency |
| Email alerts | HTML emails for price drops, increases, and periodic updates |
| Savings reports | Total drops, month-over-month change, marketplace breakdown, charts |
| Account settings | Profile name and locale updates |
| Landing page | Marketing site with pricing tiers (Free / Pro / Enterprise — UI only) |
| Dark/light theme | System-aware theme toggle |
| Localization | English (`en`) and Turkish (`tr`) |

### Technical

| Feature | Description |
|---------|-------------|
| Microservices architecture | Six backend modules + shared library |
| Shared MongoDB | Single database (`ocadyn`) with domain collections |
| JWT authentication | Stateless bearer tokens across public APIs |
| Internal service mesh | `X-Internal-Api-Key` header for `/internal/**` routes |
| Scheduled price checks | Spring `@Scheduled` job in scraper-service |
| HTML scraping | Jsoup-based parsers per marketplace |
| OpenAPI / Swagger | Available on auth, tracker, notification, and report services |
| Spring Actuator | Health endpoints on all services |
| API gateway | nginx reverse proxy on port `8080` |

### Integrations and external services

| Integration | Usage |
|-------------|-------|
| **MongoDB 7** | Primary data store |
| **SMTP** | Email delivery via Spring Mail (Gmail, Outlook, Yandex, etc.) |
| **MailHog** | Optional local SMTP capture (`docker compose --profile dev-mail up`) |
| **Amazon / Trendyol / N11 / Walmart** | Live product page fetching and HTML parsing |
| **nginx 1.27** | Reverse proxy and CORS gateway |

> **Not found in repository:** Redis, PostgreSQL, AWS SES, payment providers, SMS/phone providers (UI exposes channel toggles; backend email is implemented, SMS/phone are not).

---

## Tech Stack

### Frontend (`ui/ui-price-tracker/`)

| Technology | Version / Notes |
|------------|-----------------|
| Astro | 6.x — static site + islands architecture |
| React | 19.x — interactive dashboard components |
| TypeScript | Strict typing throughout |
| Tailwind CSS | 4.x via `@tailwindcss/vite` |
| Zustand | Client state + persisted auth |
| Recharts | Price history and report charts |
| Radix UI / CVA | UI primitives |
| Framer Motion | Animations |
| `serve` | Static file server in production Docker image |

### Backend (`services/`)

| Technology | Version / Notes |
|------------|-----------------|
| Java | 21 |
| Spring Boot | 3.3.1 |
| Spring Security | JWT + BCrypt |
| Spring Data MongoDB | Document persistence |
| Spring Mail | SMTP email |
| Spring Scheduling | Price check cron |
| Gradle | 8.14 (wrapper included) |
| JJWT | 0.12.6 |
| SpringDoc OpenAPI | 2.6.0 |
| Jsoup | 1.18.1 — HTML parsing in scraper-service |
| JUnit 5 | Unit tests |

### Infrastructure

| Component | Role |
|-----------|------|
| Docker / Docker Compose | Container orchestration |
| nginx | API gateway + UI proxy |
| MongoDB 7 | Database |
| MailHog | Dev mail testing (optional profile) |

### DevOps

> **Not found in repository:** GitHub Actions workflows, Kubernetes manifests, Terraform, or cloud deployment scripts under `.github/` or `infra/`.

---

## Architecture

### High-level overview

```
┌─────────────────────────────────────────────────────────────────┐
│  ui-price-tracker (Astro + React)                               │
│  Static SPA served on :4321 (internal)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP (browser → :8080)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  nginx (:8080) — API gateway                                    │
│  /api/auth → auth-service                                       │
│  /api/products → tracker-service                                │
│  /api/notifications → notification-service                      │
│  /api/reports → report-service                                  │
│  / → ui-price-tracker                                           │
└─────┬──────────┬──────────────┬──────────────┬──────────────────┘
      │          │              │              │
      ▼          ▼              ▼              ▼
 auth-service  tracker-service  notification-service  report-service
   :9090          :9092              :9091               :9094
      │              │                   ▲                  │
      │              └──────► scraper-service ──────────────┘
      │                         :9093
      │              (scheduled price checks + HTML scrape)
      └──────────────────────────► MongoDB (:27017 / ocadyn)
```

### Application flow

1. **Registration / login** — `auth-service` creates a user in MongoDB (`users` collection), hashes the password with BCrypt, and returns a JWT.
2. **Track product** — User submits a URL via `POST /api/products`. `tracker-service` validates the marketplace, calls `scraper-service` (`POST /internal/scrape`), and persists a `tracked_products` document with initial price history.
3. **Scheduled checks** — `scraper-service` runs `PriceCheckScheduler` on a configurable interval (default 5 minutes). For each active product due for a check, it re-scrapes the URL, updates price via `PATCH /internal/products/{id}/price`, and evaluates notification rules.
4. **Notifications** — When threshold or periodic rules match, scraper calls `POST /internal/notifications`. `notification-service` stores an in-app alert and optionally sends SMTP email.
5. **Reports** — `report-service` reads `tracked_products` and `notifications` from MongoDB to compute savings summaries and chart data.

### Design decisions

- **Shared MongoDB, separate services** — Each service owns its domain collections but connects to the same `ocadyn` database. There is no separate user-service; user data lives in `auth-service` and is read by notification-service for email delivery.
- **Internal API key** — Service-to-service calls to `/internal/**` require header `X-Internal-Api-Key`, validated by `InternalApiKeyFilter` in `common-lib`.
- **Push channel as gate** — The scheduler only processes products where `notificationSettings.channels.push` is `true`. Email is sent additionally when `channels.email` is enabled.
- **Same-origin API in production** — The UI uses relative `/api/*` paths through nginx; `PUBLIC_API_BASE_URL` stays empty in Docker builds.
- **Real scraping, bot-aware** — `PageFetcher` uses browser-like headers and detects CAPTCHA/bot challenge pages rather than returning fake prices.

### Major modules

| Module | Port | Responsibility |
|--------|------|----------------|
| `common-lib` | — | Enums, DTOs, JWT, security filters, exception handling, marketplace utilities |
| `auth-service` | 9090 | Register, login, JWT issuance, profile (`/api/auth/*`) |
| `tracker-service` | 9092 | Product CRUD, favorites, stats, notification settings, internal price APIs |
| `notification-service` | 9091 | Notification inbox, email templates, internal alert creation |
| `scraper-service` | 9093 | HTML fetch/parse, scheduled price checks, internal scrape API |
| `report-service` | 9094 | Savings and analytics summary |

---

## Project Structure

```
ocadyn/
├── docker-compose.yml          # Full-stack orchestration (MongoDB, services, nginx, UI)
├── .env.example                # Root SMTP and optional stack secrets for Docker Compose
├── infra/
│   └── nginx/
│       └── nginx.conf          # API gateway routing and CORS headers
├── services/                   # Gradle multi-module backend
│   ├── build.gradle            # Root build; Java 21, Spring Boot 3.3.1
│   ├── settings.gradle         # Module includes
│   ├── dependencies.gradle     # Shared dependency versions
│   ├── gradlew                 # Gradle wrapper (Unix shell script)
│   ├── gradle/wrapper/         # Gradle 8.14 wrapper JAR
│   ├── common-lib/             # Shared library (JWT, security, enums, utilities)
│   ├── auth-service/           # Authentication + user documents
│   ├── tracker-service/        # Tracked products and price history
│   ├── notification-service/   # Alerts and SMTP email
│   ├── scraper-service/        # Marketplace parsers + scheduler
│   ├── report-service/         # Analytics and chart data
│   └── README.md               # Backend-focused quick reference
└── ui/
    └── ui-price-tracker/       # Astro + React frontend
        ├── astro.config.mjs    # Vite, Tailwind, /api dev proxy
        ├── Dockerfile          # Multi-stage Node build + serve
        ├── package.json
        ├── public/             # Static assets, marketplace icons
        └── src/
            ├── pages/          # Astro routes (landing, auth, dashboard)
            ├── components/     # React UI (dashboard, charts, forms)
            ├── lib/            # API client, config, mappers
            ├── store/          # Zustand stores (auth, products, notifications)
            ├── i18n/           # en.json, tr.json translations
            ├── hooks/          # React hooks
            ├── types/          # TypeScript types
            └── styles/         # Global CSS and theme
```

> **Not found in repository:** `docs/` directory (referenced in older documentation), `LICENSE` file, `gradlew.bat` (Windows Gradle wrapper batch file), CI workflow definitions.

---

## Prerequisites

| Requirement | Version / Notes |
|-------------|---------------|
| **JDK** | 21 (Eclipse Temurin used in Dockerfiles) |
| **Node.js** | ≥ 22.12.0 (see `ui/ui-price-tracker/package.json`) |
| **npm** | Comes with Node.js |
| **MongoDB** | 7.x (local install or via Docker) |
| **Docker & Docker Compose** | Recommended for full-stack local/production-like setup |
| **Git** | Clone and contribute |
| **SMTP credentials** | Required for real email alerts (optional for local dev) |

---

## Installation

### Option A — Full stack with Docker (recommended)

From a fresh machine:

```bash
# 1. Clone the repository
git clone <repository-url>
cd ocadyn

# 2. Configure email (optional but needed for real alerts)
cp .env.example .env
# Edit .env with your SMTP credentials (see Environment Variables)

# 3. Build and start all services
docker compose up --build
```

Open the application at **http://localhost:8080**.

Optional local mail capture:

```bash
docker compose --profile dev-mail up --build
# MailHog UI: http://localhost:8025
# Set MAIL_HOST=mailhog, MAIL_PORT=1025 in .env when using this profile
```

### Option B — Local development (backend + UI separately)

**1. Start MongoDB**

```bash
docker run -d --name ocadyn-mongodb -p 27017:27017 mongo:7
```

**2. Build backend**

```bash
cd services

# Linux / macOS
./gradlew clean build

# Windows (no gradlew.bat in repo — use wrapper JAR directly)
java -classpath "gradle\wrapper\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain clean build
```

**3. Run backend services** (separate terminals; shared env vars)

```bash
# Example: auth-service
cd services
./gradlew :auth-service:bootRun

# Repeat for :tracker-service, :notification-service, :scraper-service, :report-service
```

Default MongoDB URI: `mongodb://localhost:27017/ocadyn`

**4. Run nginx gateway** (required for unified `/api` routing the UI expects)

Either use Docker Compose for nginx + services, or run only the gateway:

```bash
docker compose up mongodb auth-service tracker-service notification-service scraper-service report-service nginx
```

**5. Run frontend dev server**

```bash
cd ui/ui-price-tracker
cp .env.example .env
npm install
npm run dev
```

Dev server: **http://localhost:4321** — Vite proxies `/api` to `http://localhost:8080` (configurable via `API_PROXY_TARGET`).

---

## Environment Variables

All variables discovered in `application.yml`, `application-docker.yml`, `docker-compose.yml`, and UI config files.

### Backend / Docker Compose

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URI` | Required for DB services | MongoDB connection string | `mongodb://localhost:27017/ocadyn` |
| `JWT_SECRET` | Required in production | Shared HMAC secret for JWT signing (min 32 chars recommended) | `your-production-secret-min-32-characters` |
| `JWT_EXPIRATION_MS` | Optional | Token lifetime in milliseconds | `86400000` (24 h) |
| `INTERNAL_API_KEY` | Required in production | Service-to-service auth for `/internal/**` | `ocadyn-internal-dev-key` |
| `CORS_ALLOWED_ORIGINS` | Optional | Comma-separated allowed origins | `http://localhost:4321,http://localhost:8080` |
| `SERVER_PORT` | Optional | Per-service HTTP port override | `9090` |
| `SPRING_PROFILES_ACTIVE` | Optional | Spring profile (`docker` in containers) | `docker` |
| `SCRAPER_SERVICE_URL` | Optional | Tracker → scraper base URL | `http://localhost:9093` |
| `TRACKER_SERVICE_URL` | Optional | Scraper → tracker base URL | `http://localhost:9092` |
| `NOTIFICATION_SERVICE_URL` | Optional | Scraper → notification base URL | `http://localhost:9091` |
| `PRICE_CHECK_DELAY_MS` | Optional | Scheduler interval between price check runs (ms) | `300000` (5 min) |
| `MAIL_ENABLED` | Optional | Enable/disable mail sending logic | `true` |
| `MAIL_HOST` | Required for email | SMTP server hostname | `smtp.gmail.com` |
| `MAIL_PORT` | Optional | SMTP port | `587` |
| `MAIL_USER` | Required for email | SMTP username | `you@gmail.com` |
| `MAIL_PASS` | Required for email | SMTP password or app password | `your-app-password` |
| `MAIL_FROM` | Required for email | Sender address | `you@gmail.com` |
| `MAIL_SMTP_AUTH` | Optional | SMTP AUTH enabled | `true` |
| `MAIL_SMTP_STARTTLS` | Optional | STARTTLS enabled | `true` |
| `MAIL_SMTP_STARTTLS_REQUIRED` | Optional | Require STARTTLS | `false` |
| `MAIL_SMTP_SSL` | Optional | SSL enabled (e.g. Yandex on 465) | `false` |
| `APP_URL` | Optional | Base URL embedded in email links | `http://localhost:8080` |
| `OCADYN_MAIL_FROM` | Optional | Fallback for `MAIL_FROM` in notification-service | `noreply@ocadyn.app` |

### Frontend (`ui/ui-price-tracker/`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PUBLIC_API_BASE_URL` | Optional | API base URL baked at build time. Empty = same-origin `/api/*` | `` (empty) |
| `API_PROXY_TARGET` | Optional | Dev-only Vite proxy target for `/api` | `http://localhost:8080` |

---

## Configuration

### Spring profiles

- **Default** — Local development; MongoDB at `localhost:27017`.
- **`docker`** — Activated in containers; MongoDB host `mongodb`, inter-service URLs use Docker network hostnames.

### Notification defaults

New products inherit defaults from `NotificationSettings`:

- Channels: email `true`, push `true`, SMS/phone `false`
- Frequency: `TWELVE_HOURS`
- Instant alerts: disabled until configured

Updating notification settings requires `channels.push = true` (validated in `ProductService`).

### Price check scheduling

`NotificationDeliveryPolicy` controls when checks and periodic digests fire:

- Instant alerts: 5-minute minimum interval between checks
- Periodic digests: clock-aligned in `Europe/Istanbul` timezone
- Frequencies: `HOURLY`, `SIX_HOURS`, `TWELVE_HOURS`, `DAILY`, `WEEKLY`

### Supported marketplaces

Detected from URL hostname (`MarketplaceDetector`):

- Amazon (`amazon` in host)
- Trendyol (`trendyol` in host)
- N11 (`n11` in host)
- Walmart (`walmart` in host)

Other URLs return HTTP 422 with: *"This marketplace is not supported..."*

---

## Running Locally

### Docker (simplest)

```bash
docker compose up --build
```

| Endpoint | URL |
|----------|-----|
| Application (UI + API) | http://localhost:8080 |
| MongoDB | localhost:27017 |
| MailHog (dev profile) | http://localhost:8025 |

### Individual service Swagger (direct access, no gateway)

| Service | Swagger UI |
|---------|------------|
| auth-service | http://localhost:9090/swagger-ui.html |
| tracker-service | http://localhost:9092/swagger-ui.html |
| notification-service | http://localhost:9091/swagger-ui.html |
| report-service | http://localhost:9094/swagger-ui.html |

> scraper-service does not expose SpringDoc OpenAPI in the codebase.

### Frontend development workflow

```bash
cd ui/ui-price-tracker
npm install
npm run dev
```

1. Ensure the API gateway is reachable at `API_PROXY_TARGET` (default `http://localhost:8080`).
2. Register at `/register`, sign in, and use the dashboard at `/dashboard`.
3. Paste a supported product URL via **Quick Add** on the dashboard.

---

## Build Process

### Backend

```bash
cd services
./gradlew clean build          # Compile, test, and produce boot JARs
./gradlew :auth-service:bootJar # Build a single service JAR
```

Output JARs: `services/<module>/build/libs/<module>.jar`

Docker builds use multi-stage Dockerfiles per service (JDK 21 build → JRE 21 runtime).

### Frontend

```bash
cd ui/ui-price-tracker
npm ci
npm run build    # Output: dist/
npm run preview  # Preview production build locally
```

Docker UI build sets `PUBLIC_API_BASE_URL=""` so the SPA uses relative API paths through nginx.

---

## Deployment

Deployment procedures are defined via **Docker Compose** at the repository root. Production deployment would typically:

1. Set strong values for `JWT_SECRET` and `INTERNAL_API_KEY`.
2. Configure production SMTP credentials in `.env`.
3. Set `APP_URL` to the public application URL.
4. Run `docker compose up -d --build`.
5. Expose port `8080` (or place a TLS-terminating reverse proxy in front of nginx).

> **Not found in repository:** Cloud-specific deployment guides, Kubernetes Helm charts, or automated release pipelines.

---

## API Documentation

Public APIs are accessed through the nginx gateway at `http://localhost:8080` unless noted otherwise.

### Authentication

- **Scheme:** Bearer JWT
- **Header:** `Authorization: Bearer <token>`
- **Obtain token:** `POST /api/auth/register` or `POST /api/auth/login`
- **Token contents:** `uid` (user ID), `sub` (email), `name`, standard expiry

### Auth endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| GET | `/api/auth/me` | Yes | Current user profile |
| PATCH | `/api/auth/me` | Yes | Update name/locale |

**Register request**

```json
{
  "name": "Jane Shopper",
  "email": "jane@example.com",
  "password": "secret12"
}
```

**Auth response**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Jane Shopper",
    "email": "jane@example.com",
    "plan": "FREE",
    "locale": "en"
  }
}
```

### Product endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/products` | Yes | List products (`?status=`, `?favorite=`, `?search=`) |
| GET | `/api/products/stats` | Yes | Dashboard stats |
| GET | `/api/products/{id}` | Yes | Product detail |
| POST | `/api/products` | Yes | Track product from URL |
| PATCH | `/api/products/{id}/tracking` | Yes | Set `ACTIVE` or `PAUSED` |
| PATCH | `/api/products/{id}/favorite` | Yes | Toggle favorite |
| PUT | `/api/products/{id}/notification-settings` | Yes | Update alert rules |

**Track product request**

```json
{
  "url": "https://www.amazon.com/dp/B0EXAMPLE"
}
```

### Notification endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/notifications` | Yes | List alerts (`?type=PRICE_DROP`) |
| GET | `/api/notifications/unread-count` | Yes | `{ "count": 3 }` |
| PATCH | `/api/notifications/{id}/read` | Yes | Mark one as read |
| POST | `/api/notifications/read-all` | Yes | Mark all as read |

### Report endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/reports/summary` | Yes | Savings analytics and chart data |

### Internal endpoints (service-to-service only)

Require header: `X-Internal-Api-Key: <INTERNAL_API_KEY>`

| Service | Method | Path | Purpose |
|---------|--------|------|---------|
| scraper-service | POST | `/internal/scrape` | Scrape product URL |
| tracker-service | GET | `/internal/products/active` | List active products for scheduler |
| tracker-service | PATCH | `/internal/products/{id}/price` | Apply price update |
| tracker-service | PATCH | `/internal/products/{id}/periodic-notification` | Record periodic alert timestamp |
| notification-service | POST | `/internal/notifications` | Create price change notification |

### Error format

Errors return JSON via `GlobalExceptionHandler`:

```json
{
  "message": "Product not found"
}
```

Validation errors may include a `fields` map.

---

## Database

### Technology

**MongoDB 7** — single database `ocadyn`, shared across services.

### Schema overview

| Collection | Service | Key fields |
|------------|---------|------------|
| `users` | auth-service | `email` (unique), `passwordHash`, `name`, `plan`, `locale` |
| `tracked_products` | tracker-service | `userId`, `url` (unique per user), `marketplace`, prices, `priceHistory[]`, `notificationSettings`, `trackingStatus`, `favorite` |
| `notifications` | notification-service | `userId`, `productId`, `type`, prices, `message`, `read`, `createdAt` |

Indexes:

- `users.email` — unique
- `tracked_products` — compound unique on `(userId, url)`
- `notifications` — compound on `(userId, createdAt desc)`

### Migrations

> **Not found in repository:** Flyway, Liquibase, or MongoDB migration scripts. Schema evolves through Spring Data MongoDB document models.

### Seeding

> **Not found in repository:** Seed scripts or demo data loaders. Create data by registering a user and tracking products via the API or UI.

---

## Authentication & Authorization

### User authentication flow

1. Client sends credentials to `POST /api/auth/login` or registers via `POST /api/auth/register`.
2. `auth-service` validates credentials (BCrypt) and returns a signed JWT.
3. Client stores the token (Zustand persist in `localStorage` key `ocadyn-auth`).
4. Subsequent API calls include `Authorization: Bearer <token>`.
5. `JwtAuthenticationFilter` (in `common-lib`) validates the token and sets the security context.
6. `CurrentUserResolver` / `AuthUserResolver` extract the user ID for service logic.

### Authorization rules

- Public: `/api/auth/register`, `/api/auth/login`, actuator health, Swagger docs
- Authenticated: all other `/api/**` routes
- Internal: `/internal/**` requires valid `X-Internal-Api-Key` (JWT not required)
- Users can only access their own products and notifications (enforced by `userId` in queries)

### User plans

`UserPlan` enum: `FREE`, `PRO`, `ENTERPRISE` — stored on user documents; plan enforcement logic is not implemented in backend services beyond storage.

---

## Scripts

### Backend (`services/`)

| Command | Description |
|---------|-------------|
| `./gradlew clean build` | Build all modules and run tests |
| `./gradlew :auth-service:bootRun` | Run auth-service locally |
| `./gradlew :tracker-service:bootRun` | Run tracker-service locally |
| `./gradlew :notification-service:bootRun` | Run notification-service locally |
| `./gradlew :scraper-service:bootRun` | Run scraper-service locally |
| `./gradlew :report-service:bootRun` | Run report-service locally |
| `./gradlew test` | Run all unit tests |
| `./gradlew :common-lib:test` | Run common-lib tests only |

### Frontend (`ui/ui-price-tracker/`)

| Script | Description |
|--------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start Astro dev server on port 4321 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run astro` | Astro CLI |

### Root

| Command | Description |
|---------|-------------|
| `docker compose up --build` | Build and start full stack |
| `docker compose --profile dev-mail up --build` | Full stack + MailHog |

> **Not found in repository:** Makefile, root `package.json`, or shell task runner scripts.

---

## Testing

### Framework

- **Backend:** JUnit 5 via Spring Boot Test (`useJUnitPlatform()` in Gradle)
- **Frontend:** No test scripts or test files found in `ui/ui-price-tracker/`

### Running tests

```bash
cd services
./gradlew test
```

### Test coverage by module

| Module | Test file(s) |
|--------|--------------|
| `common-lib` | `JwtServiceTest`, `MarketplaceUtilsTest` |
| `auth-service` | `AuthServiceTest` |
| `tracker-service` | `PriceHistoryUtilsTest` |
| `notification-service` | `NotificationServiceTest` |
| `scraper-service` | `TrendyolHtmlParserTest`, `WalmartHtmlParserTest` |
| `report-service` | No tests found |

> **Not found in repository:** JaCoCo or other coverage reporting configuration.

---

## Docker

### Services defined in `docker-compose.yml`

| Container | Image / Build | Port (host) | Notes |
|-----------|---------------|-------------|-------|
| `ocadyn-mongodb` | `mongo:7` | 27017 | Persistent volume `mongodb_data` |
| `ocadyn-auth-service` | Built from `services/auth-service/Dockerfile` | internal 9090 | Health check via actuator |
| `ocadyn-tracker-service` | Built from `services/tracker-service/Dockerfile` | internal 9092 | |
| `ocadyn-notification-service` | Built from `services/notification-service/Dockerfile` | internal 9091 | |
| `ocadyn-scraper-service` | Built from `services/scraper-service/Dockerfile` | internal 9093 | Depends on tracker + notification |
| `ocadyn-report-service` | Built from `services/report-service/Dockerfile` | internal 9094 | |
| `ocadyn-nginx` | `nginx:1.27-alpine` | **8080** | Public entry point |
| `ocadyn-ui` | Built from `ui/ui-price-tracker/Dockerfile` | internal 4321 | Served via nginx `/` |
| `ocadyn-mailhog` | `mailhog/mailhog:v1.0.1` | 1025, 8025 | Optional `dev-mail` profile |

All Java service containers run as non-root user `ocadyn` and include `curl` for health checks.

---

## CI/CD

> **Not found in repository:** GitHub Actions workflows (`.github/workflows/`), GitLab CI, Jenkins, or other automated pipeline configuration. The previous README mentioned GitHub Actions, but no workflow files exist in the current codebase.

---

## Security

### Implemented controls

- **Password hashing:** BCrypt via Spring Security
- **JWT:** HMAC-signed tokens with configurable expiry
- **Internal API key:** Required for inter-service `/internal/**` calls
- **CORS:** Configurable allowed origins; nginx adds CORS headers at gateway
- **Stateless sessions:** No server-side session store
- **Non-root Docker users:** Java containers run as `ocadyn` user
- **Input validation:** Jakarta Bean Validation on request DTOs

### Production recommendations

1. Replace all default secrets (`JWT_SECRET`, `INTERNAL_API_KEY`).
2. Use TLS in front of nginx (not configured in repo).
3. Restrict MongoDB network access to application containers only.
4. Use app-specific SMTP credentials (e.g. Gmail App Passwords).
5. Monitor scraper failures — marketplaces may block automated access (`PageFetcher` detects bot challenges).
6. Do not commit `.env` files (listed in `.gitignore`).

---

## Performance Considerations

- **Scheduled batch processing** — Price checks iterate active products sequentially; large watchlists increase scrape duration per scheduler cycle.
- **Configurable scheduler delay** — `PRICE_CHECK_DELAY_MS` (default 5 minutes) balances freshness vs. load.
- **Daily price history compaction** — `PriceHistoryUtils.compactByDay()` limits history growth.
- **nginx dynamic upstream resolution** — Docker DNS re-resolution (`resolver 127.0.0.11`) handles container restarts.
- **HTTP client timeouts** — Scraper uses 15 s connect / 30 s read timeouts.
- **Instant alert interval** — 5-minute minimum between threshold checks when instant alerts are enabled.

---

## Troubleshooting

| Issue | Likely cause | Solution |
|-------|--------------|----------|
| UI API calls fail in dev | Gateway not running | Start `docker compose up nginx` or full stack; verify `API_PROXY_TARGET` |
| Email not sent | SMTP not configured | Set `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` in `.env`; check notification-service logs |
| "Store blocked automated access" | Marketplace bot protection | Retry later; scraping may fail for CAPTCHA-protected pages |
| "Marketplace is not supported" | URL host not recognized | Use Amazon, Trendyol, N11, or Walmart URLs |
| 401 on `/internal/**` | Missing/wrong API key | Set matching `INTERNAL_API_KEY` on caller and callee |
| Duplicate product error (409) | Same URL already tracked | Use existing product or remove duplicate |
| MongoDB connection refused | DB not running | Start MongoDB locally or via `docker compose up mongodb` |
| Gradle fails on Windows | No `gradlew.bat` | Use `java -classpath gradle\wrapper\gradle-wrapper.jar org.gradle.wrapper.GradleWrapperMain <task>` |
| JWT invalid after restart | Secret changed | Re-login; ensure `JWT_SECRET` is consistent across all services |

---

## Contributing

1. Fork the repository and create a feature branch (`feature/your-feature`).
2. Follow existing code conventions (Java package `com.ocadyn`, TypeScript path alias `@/`).
3. Run `./gradlew test` for backend changes.
4. Keep changes focused; match surrounding style and abstractions.
5. Open a pull request with a clear description and test plan.

> **Not found in repository:** `CONTRIBUTING.md`, issue templates, or code of conduct files.

---

## License

The previous README references an **MIT License**, but **no `LICENSE` file was found in the repository**. Confirm licensing with the repository owner before redistribution.

---

## Future Improvements

Reasonable enhancements suggested by the current codebase and UI:

| Area | Suggestion |
|------|------------|
| **Marketplaces** | Add Hepsiburada and eBay parsers (mentioned in landing copy but not in `SupportedMarketplaces`) |
| **Channels** | Implement SMS and phone notification backends (UI toggles exist; only email is wired) |
| **Plans** | Enforce Free/Pro/Enterprise limits (product count, check frequency) |
| **Stock tracking** | Back-in-stock alerts (listed as future on landing page) |
| **Scraper resilience** | Proxy rotation, retry queues, and structured scrape failure metrics |
| **CI/CD** | Add GitHub Actions for Gradle test + Docker build on PR |
| **Migrations** | MongoDB schema migration tooling for production upgrades |
| **Frontend tests** | Component and E2E tests for dashboard flows |
| **Public API** | Developer API keys and documented rate limits |
| **License** | Add an explicit `LICENSE` file |
| **Windows DX** | Add `gradlew.bat` for native Windows Gradle wrapper support |
| **Documentation** | Populate `docs/` with runbooks and architecture decision records |

---

<p align="center">
  <strong>OCADYN</strong> — The right product, at the right price, at the right time.
</p>
