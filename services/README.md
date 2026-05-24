# OCADYN Backend

Microservices backend for the OCADYN price tracking platform.

## Stack

- Java 21
- Spring Boot 3.3
- MongoDB (shared instance, domain collections)
- Spring Security + shared JWT (`common-lib`)
- Nginx API gateway
- Docker Compose

## Modules

| Module | Port | Description |
|--------|------|-------------|
| `common-lib` | — | Shared enums, JWT, security filters, exception handling |
| `auth-service` | 9090 | Register, login, JWT issuance, user profile |
| `tracker-service` | 9092 | Tracked products CRUD, favorites, notification settings, stats |
| `notification-service` | 9091 | Notification inbox |
| `scraper-service` | 9093 | URL scrape simulation, scheduled price checks, internal APIs |
| `report-service` | 9094 | Savings and analytics reports |

Public API is exposed through **nginx on port 8080**.

## Architecture

```
Frontend (Astro/React)
        │
        ▼ :8080
      nginx
   ┌────┼────────────┬──────────────┐
   ▼    ▼            ▼              ▼
 auth  tracker   notification    report
 :9090  :9092       :9091         :9094
   │      │            ▲              │
   │      └──────► scraper ──────────┘
   │               :9093
   └──────────────► MongoDB ◄────────┘
```

Internal service calls use header `X-Internal-Api-Key` (`INTERNAL_API_KEY`).

## Run locally

### Prerequisites

- JDK 21
- MongoDB on `localhost:27017`

### Build all services

```powershell
cd services
java -classpath "gradle\wrapper\gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain build -x test --no-daemon
```

### Start a service

```powershell
cd services
.\gradlew.bat :auth-service:bootRun
```

Swagger UI (auth): http://localhost:9090/swagger-ui.html

## Docker (full stack)

From repository root:

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| UI | http://localhost:4321 |
| API gateway | http://localhost:8080 |
| Auth Swagger | http://auth-service:9090/swagger-ui.html (internal) |
| MongoDB | localhost:27017 |

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://localhost:27017/ocadyn` | Mongo connection string |
| `JWT_SECRET` | dev default | Shared HMAC secret (min 32 chars) |
| `JWT_EXPIRATION_MS` | `86400000` | Token TTL |
| `INTERNAL_API_KEY` | dev default | Internal service-to-service auth |
| `CORS_ALLOWED_ORIGINS` | localhost origins | Comma-separated |
| `PRICE_CHECK_DELAY_MS` | `3600000` | Scheduled price check interval |
| `SCRAPER_SERVICE_URL` | `http://localhost:9093` | Tracker → scraper |
| `TRACKER_SERVICE_URL` | `http://localhost:9092` | Scraper → tracker |
| `NOTIFICATION_SERVICE_URL` | `http://localhost:9091` | Scraper → notification |

## API overview (via gateway :8080)

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/me`

### Products

- `GET /api/products`
- `GET /api/products/stats`
- `GET /api/products/{id}`
- `POST /api/products`
- `PATCH /api/products/{id}/tracking`
- `PATCH /api/products/{id}/favorite`
- `PUT /api/products/{id}/notification-settings`

### Notifications

- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/{id}/read`
- `POST /api/notifications/read-all`

### Reports

- `GET /api/reports/summary`

## Internal APIs (service mesh)

| Service | Endpoint | Purpose |
|---------|----------|---------|
| scraper | `POST /internal/scrape` | Initial URL scrape |
| tracker | `GET /internal/products/active` | Active products for scheduler |
| tracker | `PATCH /internal/products/{id}/price` | Apply simulated price update |
| notification | `POST /internal/notifications` | Create price change alert |

Price scraping is simulated for demo purposes. Replace `PriceScraperService` with real marketplace integrations in production.
