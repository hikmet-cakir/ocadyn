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
├── apps/
│   ├── web/                  # Frontend application
│   │   ├── components/       # UI components
│   │   ├── pages/            # Page views
│   │   └── services/         # API clients
│   │
│   └── api/                  # Backend API
│       ├── routes/           # API endpoints
│       ├── services/
│       │   ├── scraper/      # Site-specific scrapers
│       │   ├── tracker/      # Tracking business logic
│       │   └── mailer/       # Email delivery service
│       ├── models/           # Database models
│       └── jobs/             # Scheduled jobs
│
├── packages/
│   └── shared/               # Shared types and utility functions
│
├── infra/                    # Infrastructure config (Docker, CI/CD)
└── docs/                     # Project documentation
```

---

## ⚙️ Tech Stack

### Backend
- **Node.js / TypeScript** — API server
- **PostgreSQL** — Primary database (products, users, trackers, price history)
- **Redis** — Queue management and caching
- **BullMQ** — Job scheduling and queue system
- **Playwright / Cheerio** — Web scraping engine

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

- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/ocadyn.git
cd ocadyn

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit the .env file with your own configuration

# Run database migrations
npm run db:migrate

# Start the development server
npm run dev
```

### Running with Docker

```bash
docker compose up -d
```

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
