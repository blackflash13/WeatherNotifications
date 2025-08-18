# Docker Build Script Guide

## 🚀 Overview

The `docker-build.sh` script is a comprehensive management tool for the Weather Notification System. It simplifies Docker operations, provides debugging capabilities, and streamlines the development workflow.

## 📋 Prerequisites

- **Docker Desktop** installed and running
- **Docker Compose** v2.0+
- **Bash shell** (macOS/Linux) or Git Bash (Windows)
- **curl** for health checks
- **redis-cli** (optional, for Redis connectivity tests)
- **mongosh** (optional, for MongoDB connectivity tests)

## 🛠️ Getting Started

### 1. Make the script executable

```bash
chmod +x docker-build.sh
```

### 2. Initial setup

```bash
./docker-build.sh setup
```

This will:

- Create `.env` file from template
- Create necessary directories
- Set proper permissions

### 3. Configure environment

Edit the `docker-compose.yml` file with your private API credentials:

**⚠️ REQUIRED: Weather API Configuration**

You MUST add the following environment variables to the `weather-fetcher` service in `docker-compose.yml`:

```yaml
weather-fetcher:
    # ... existing configuration ...
    environment:
        - NODE_ENV=production
        - PORT=3000
        - REDIS_URL=redis://redis:6379
        - CACHE_TTL_SECONDS=1800
        # ADD THESE REQUIRED VARIABLES:
        - WEATHER_API_URL=https://your-weather-api.com/endpoint
        - WEATHER_API_KEY=your-private-api-key-here
```

## 📚 Commands Reference

### 🏗️ Building Services

#### Build all services

```bash
./docker-build.sh build
```

- Builds all application services
- Offers parallel building for faster builds
- Choose **Yes** for parallel builds (faster, 60-80% time reduction)
- Choose **No** for sequential builds (better error tracking)

#### Build specific service

```bash
./docker-build.sh build-service weather-fetcher
./docker-build.sh build-service notification-sender-hourly
```

**Available services:**

- `weather-fetcher`
- `weather-scheduler-hourly`
- `weather-scheduler-daily`
- `notification-sender-hourly`
- `notification-sender-daily`

### 🚀 Starting Services

#### Start all services

```bash
./docker-build.sh up
```

- Starts all services including infrastructure
- Waits for services to be ready
- Shows service status

#### Start only infrastructure

```bash
./docker-build.sh up-infra
```

Starts only:

- Redis (caching)
- MongoDB (database)
- RabbitMQ (message queue)

### 🛑 Stopping Services

#### Stop all services

```bash
./docker-build.sh down
```

### 📊 Monitoring & Debugging

#### Check service status

```bash
./docker-build.sh status
```

#### Health check all services

```bash
./docker-build.sh health
```

Checks:

- Container status
- HTTP endpoints
- Database connectivity
- Message queue accessibility

#### View logs

```bash
# All services
./docker-build.sh logs

# Specific service
./docker-build.sh logs-service weather-fetcher
```

#### Debug failing service

```bash
./docker-build.sh debug weather-scheduler-hourly
```

Shows:

- Service status
- Recent logs (last 50 lines)
- Resource usage
- Service configuration

### 🔧 Development Operations

#### Restart service

```bash
./docker-build.sh restart weather-fetcher
```

Quick restart without rebuilding.

#### Rebuild and restart

```bash
./docker-build.sh rebuild notification-sender-hourly
```

Full rebuild cycle: Stop → Build → Start

#### Access service shell

```bash
./docker-build.sh shell weather-fetcher
```

### 🧹 Cleanup Operations

#### Clean Docker resources

```bash
./docker-build.sh clean
```

Removes:

- Unused containers
- Unused images
- Unused networks
- Optionally: unused volumes (with confirmation)

#### Reset all data (⚠️ DATA LOSS)

```bash
./docker-build.sh reset
```

**WARNING:** This removes all databases and persistent data!

## 🏗️ Service Architecture

### Infrastructure Services

- **Redis** (`redis:6379`) - Caching layer
- **MongoDB** (`mongodb:27017`) - Main database
- **RabbitMQ** (`rabbitmq:5672`) - Message queue

### Application Services

- **Weather Fetcher** (`localhost:3000`) - Weather data API
- **Weather Scheduler Hourly** (`localhost:3001`) - Hourly notifications
- **Weather Scheduler Daily** (`localhost:3011`) - Daily notifications
- **Notification Sender Hourly** (`localhost:3002`) - Hourly email processing
- **Notification Sender Daily** (`localhost:3012`) - Daily email processing

## 🔍 Health Check Endpoints

| Service                      | Endpoint                       |
| ---------------------------- | ------------------------------ |
| Weather Fetcher              | `http://localhost:3000/health` |
| Weather Scheduler (Hourly)   | `http://localhost:3001/health` |
| Weather Scheduler (Daily)    | `http://localhost:3011/health` |
| Notification Sender (Hourly) | `http://localhost:3002/health` |
| Notification Sender (Daily)  | `http://localhost:3012/health` |
