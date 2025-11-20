# Portfolio Tracker MVP

A lightweight, real-time portfolio tracking application built with React, Node.js, PostgreSQL, and Redis.

## Features

-   **Real-time Price Updates**: Live stock prices via Finnhub WebSocket API.
-   **Portfolio Management**: Create portfolios and add positions (Stocks, Crypto, Forex).
-   **Live P&L Tracking**: Automatically calculates market value and profit/loss based on live data.
-   **Currency Support**: Track positions in USD, EUR, PLN, etc.
-   **Dockerized**: Fully containerized setup for easy deployment.
-   **Robust Architecture**:
    -   **Frontend**: React + Vite + Tailwind CSS (Glassmorphism UI).
    -   **Backend**: Node.js + Express + TypeScript.
    -   **Database**: PostgreSQL for persistent storage.
    -   **Cache**: Redis for real-time price caching and Pub/Sub.

## Prerequisites

-   **Docker Desktop** installed and running.
-   **Finnhub API Key** (Free tier is sufficient).

## Getting Started

### 1. Clone & Setup
Ensure you have the project files locally.

### 2. Environment Variables
The project comes with a pre-configured `.env` file in the `server` directory.
Key variables:
-   `FINNHUB_API_KEY`: Your API key from Finnhub.io.
-   `DATABASE_URL`: Connection string for PostgreSQL (handled by Docker).
-   `REDIS_URL`: Connection string for Redis (handled by Docker).

### 3. Run with Docker
Open a terminal in the project root and run:

```powershell
# 1. Add Docker to Path (if needed on Windows PowerShell)
$env:Path = "C:\Program Files\Docker\Docker\resources\bin;" + $env:Path

# 2. Build and Start
docker compose up -d --build
```

### 4. Access the App
-   **Frontend**: [http://localhost:5173](http://localhost:5173)
-   **Backend API**: [http://localhost:3000/health](http://localhost:3000/health)

## Manual Rebuild
If you make changes to the code, you can rebuild the containers:
See `.agent/workflows/manual_docker_rebuild.md` for a detailed guide.

## Tech Stack details
-   **Frontend**: React 19, Vite, Tailwind CSS v4, Recharts, Lucide Icons.
-   **Backend**: Node.js 22, Express, `ws` (WebSocket), `pg` (Postgres), `redis`.
-   **Infrastructure**: Docker Compose.

## Troubleshooting
-   **"Connection Refused"**: Ensure Docker containers are running (`docker ps`).
-   **"Finnhub 429 Error"**: You are hitting the API rate limit. The app has auto-reconnect logic with backoff.
-   **"Vite Error"**: Ensure you are using the Docker setup which uses Node.js 22, as Vite requires Node 20+.
