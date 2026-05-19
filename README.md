# 🛒 OCADYN — Smart Price Tracking Platform

> Track products, buy at the right time. We notify you when prices drop.

---

## 📌 About

**OCADYN** is an intelligent price monitoring application that allows users to track products from various e-commerce sites through a single platform, powered by a smart notification system.

Users can paste any product link from any shopping site to instantly preview product details, then set their preferred tracking criteria. The platform automatically sends email notifications when the defined conditions are met.

---

## 🚀 Key Features

- **Universal URL Support** — Paste a product link from Amazon, eBay, Walmart, and more. The system handles the rest.
- **Instant Product Preview** — View the product image, current price, and key details immediately after pasting the URL.
- **Flexible Tracking Criteria** — Choose from price drop alerts, target price thresholds, or scheduled price digest emails.
- **Smart Email Notifications** — Receive personalized, timely emails the moment your conditions are triggered.
- **Tracking Dashboard** — Manage all your tracked products, price history, and notification logs from a single screen.

---

## 🔧 How It Works

```
1. Paste a product URL
       ↓
2. Preview product info (image, price, store name)
       ↓
3. Set your tracking criteria
   ├── Notify me when price drops below $X
   ├── Notify me on any price drop
   └── Send me the current price every [day / week]
       ↓
4. System periodically checks the price
       ↓
5. Email notification is sent when criteria is met
```

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                      Frontend                        │
│         (URL input, product preview, dashboard)      │
└─────────────────────┬────────────────────────────────┘
                      │ REST API
┌─────────────────────▼────────────────────────────────┐
│                    Backend API                       │
│   - URL parsing & validation                         │
│   - User & tracker management                        │
│   - Notification rules engine                        │
└──────┬──────────────────────────┬────────────────────┘
       │                          │
┌──────▼──────┐          ┌────────▼────────┐
│   Scraper   │          │    Scheduler    │
│   Service   │          │   (Cron Jobs)   │
│             │          │                 │
│ Fetches prices         │ Periodic price  │
│ from websites│         │ check triggers  │
└──────┬──────┘          └────────┬────────┘
       │                          │
┌──────▼──────────────────────────▼────────┐
│                 Database                 │
│     Products | Trackers | Price History  │
└──────────────────────┬───────────────────┘
                       │
              ┌────────▼────────┐
              │   Mail Service  │
              │  (SMTP / SES)   │
              └─────────────────┘
```

---

## 📬 Notification Types

| Notification Type | Description |
|---|---|
| **Price Drop** | Instant alert whenever the product price decreases by any amount |
| **Target Price** | Notification when the product reaches a user-defined price threshold |
| **Scheduled Digest** | Daily or weekly price status report delivered to your inbox |
| **Back In Stock** | Alert when an out-of-stock product becomes available again *(coming soon)* |

---

## 🗂️ Project Structure

```
ocadyn/
├── services/                 # Backend (Gradle multi-module monorepo)
│   ├── auth-service/
│   ├── user-service/
│   ├── notification-service/
│   └── scraper-service/
├── docs/                     # Project documentation
└── README.md
```

Planned top-level folders (not in repo yet): `frontend/`, `infra/`.

---

## ⚙️ Tech Stack

### Backend (`services/`)
- **Java 21** — Runtime
- **Spring Boot 3.3** — Microservices (auth, user, notification, scraper)
- **Gradle** — Multi-project build

### Frontend
- **Next.js** — Application framework
- **Tailwind CSS** — Styling system

### Infrastructure & DevOps
- **Docker** — Containerization
- **AWS SES / SMTP** — Email delivery
- **GitHub Actions** — CI/CD pipeline

---

## 📦 Getting Started

### Prerequisites

- **JDK 21**
- **Gradle** (wrapper included under `services/`)

### Backend build & run

```bash
git clone https://github.com/your-org/ocadyn.git
cd ocadyn/services

# Build all modules
./gradlew clean build

# Run a single service (example)
./gradlew :auth-service:bootRun
```

| Service | Default port |
|---------|--------------|
| auth-service | 9090 |
| notification-service | 9091 |
| user-service | 9092 |
| scraper-service | 9092 |

---

## 🔐 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ocadyn

# Redis
REDIS_URL=redis://localhost:6379

# Mail Service
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your@email.com
MAIL_PASS=your_password
MAIL_FROM="OCADYN <noreply@ocadyn.app>"

# Application
APP_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
```

---

## 🛣️ Roadmap

- [x] Product preview via URL paste
- [x] Core price tracking and email notifications
- [x] User dashboard and tracker management
- [ ] Price history chart
- [ ] Browser extension (Chrome / Firefox)
- [ ] Mobile application (iOS & Android)
- [ ] Stock availability tracking
- [ ] Multi-user / team accounts
- [ ] Webhook integrations (Slack, Discord)
- [ ] Public API access for developers

---

## 🤝 Contributing

Contributions are welcome! Please open an `issue` first to discuss the change you'd like to make, then submit a `pull request`.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is distributed under the [MIT License](LICENSE).

---

<p align="center">
  <strong>OCADYN</strong> — The right product, at the right price, at the right time.
</p>
