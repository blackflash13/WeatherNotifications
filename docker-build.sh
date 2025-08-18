#!/bin/bash

# Weather Notification System - Docker Build & Management Script
# This script helps build, run, and troubleshoot the Docker environment

set -e  # Exit on any error

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

AVAILABLE_SERVICES=("redis" "mongodb" "rabbitmq" "weather-fetcher" "weather-scheduler-hourly" "weather-scheduler-daily" "notification-sender-hourly" "notification-sender-daily")
APP_SERVICES=("weather-fetcher" "weather-scheduler-hourly" "weather-scheduler-daily" "notification-sender-hourly" "notification-sender-daily")
INFRA_SERVICES=("redis" "mongodb" "rabbitmq")

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

validate_service() {
    local service=$1
    local service_list=("${AVAILABLE_SERVICES[@]}")
    
    if [[ -z "$service" ]]; then
        log_error "Service name required"
        echo "Available services: ${AVAILABLE_SERVICES[*]}"
        return 1
    fi
    
    for valid_service in "${service_list[@]}"; do
        if [[ "$service" == "$valid_service" ]]; then
            return 0
        fi
    done
    
    log_error "Invalid service: $service"
    echo "Available services: ${AVAILABLE_SERVICES[*]}"
    return 1
}

show_usage() {
    echo "Weather Notification System - Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build          Build all Docker images"
    echo "  build-service  Build specific service (requires service name)"
    echo "  up             Start all services"
    echo "  up-infra       Start only infrastructure services (Redis, MongoDB, RabbitMQ)"
    echo "  down           Stop all services"
    echo "  logs           Show logs for all services"
    echo "  logs-service   Show logs for specific service (requires service name)"
    echo "  clean          Clean up Docker resources"
    echo "  reset          Reset all data (WARNING: DATA LOSS)"
    echo "  status         Show status of all services"
    echo "  health         Check health of all services"
    echo "  shell          Access shell of specific service (requires service name)"
    echo "  debug          Debug failing service (requires service name)"
    echo "  setup          Initial setup with environment file creation"
    echo "  restart        Restart specific service (requires service name)"
    echo "  rebuild        Rebuild and restart specific service (requires service name)"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build"
    echo "  $0 build-service weather-fetcher"
    echo "  $0 logs-service weather-fetcher"
    echo "  $0 shell weather-fetcher"
    echo "  $0 debug weather-scheduler-hourly"
    echo "  $0 restart weather-fetcher"
    echo "  $0 rebuild notification-sender-hourly"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker Desktop."
        exit 1
    fi

    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
}

check_environment() {
    if [[ ! -f ".env" ]]; then
        log_warning ".env file not found. Creating from template..."
        if [[ -f ".env.example" ]]; then
            cp .env.example .env
            log_info "Please edit .env file with your configuration before continuing"
            return 1
        else
            log_error ".env.example file not found"
            return 1
        fi
    fi
    return 0
}

build_all() {
    log_info "Building all Docker images..."

    services=("${APP_SERVICES[@]}")

    # for parallel builds
    read -p "Build in parallel for faster builds? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Building services in parallel..."
        if docker compose build "${services[@]}"; then
            log_success "All services built successfully (parallel)"
        else
            log_error "Failed to build services in parallel"
            return 1
        fi
    else
        # Sequential builds
        for service in "${services[@]}"; do
            log_info "Building $service..."
            if docker compose build "$service"; then
                log_success "$service built successfully"
            else
                log_error "Failed to build $service"
                return 1
            fi
        done
        log_success "All services built successfully"
    fi
}

build_service() {
    local service=$1
    validate_service "$service" || return 1

    log_info "Building $service..."
    if docker compose build "$service"; then
        log_success "$service built successfully"
    else
        log_error "Failed to build $service"
        return 1
    fi
}

start_all() {
    log_info "Starting all services..."
    if docker compose up -d; then
        log_success "All services started"
        log_info "Waiting for services to be ready..."
        sleep 10
        show_status
    else
        log_error "Failed to start services"
        return 1
    fi
}

start_infrastructure() {
    log_info "Starting infrastructure services..."
    if docker compose up -d "${INFRA_SERVICES[@]}"; then
        log_success "Infrastructure services started"
        log_info "Waiting for services to be ready..."
        sleep 10
        show_status
    else
        log_error "Failed to start infrastructure services"
        return 1
    fi
}

stop_all() {
    log_info "Stopping all services..."
    if docker compose down; then
        log_success "All services stopped"
    else
        log_error "Failed to stop services"
        return 1
    fi
}

show_logs() {
    local service=$1
    if [[ -z "$service" ]]; then
        log_info "Showing logs for all services..."
        docker compose logs -f
    else
        log_info "Showing logs for $service..."
        docker compose logs -f "$service"
    fi
}

clean_docker() {
    log_warning "Cleaning up Docker resources..."

    docker compose down

    docker container prune -f

    docker image prune -f

    read -p "Remove unused volumes? This may delete data (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker volume prune -f
    fi

    docker network prune -f

    log_success "Docker cleanup completed"
}

reset_data() {
    log_warning "This will remove ALL data including databases!"
    read -p "Are you sure you want to reset all data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Stopping all services..."
        docker compose down -v

        log_info "Removing project volumes..."

        local project_name=$(docker compose config | grep -E "^name:" | cut -d' ' -f2 2>/dev/null || basename "$(pwd)" | tr '[:upper:]' '[:lower:]')
        

        volumes_to_remove=$(docker volume ls -q | grep "^${project_name}_" 2>/dev/null || true)
        
        if [[ -n "$volumes_to_remove" ]]; then
            log_info "Found volumes: $volumes_to_remove"
            echo "$volumes_to_remove" | xargs -r docker volume rm
        else
            log_warning "No project volumes found to remove"
        fi

        log_success "All data reset completed"
    else
        log_info "Reset cancelled"
    fi
}

show_status() {
    log_info "Service status:"
    docker compose ps
}

check_health() {
    log_info "Checking service health..."

    services=("${AVAILABLE_SERVICES[@]}")

    for service in "${services[@]}"; do
        if docker compose ps "$service" | grep -q "Up"; then
            log_success "$service is running"
        else
            log_error "$service is not running"
        fi
    done


    log_info "Checking service endpoints..."


    declare -A service_endpoints=(
        ["weather-fetcher"]="http://localhost:3000/health"
        ["weather-scheduler-hourly"]="http://localhost:3001/health"
        ["weather-scheduler-daily"]="http://localhost:3011/health"
        ["notification-sender-hourly"]="http://localhost:3002/health"
        ["notification-sender-daily"]="http://localhost:3012/health"
        ["rabbitmq"]="http://localhost:15672"
        ["redis"]="redis://localhost:6379"
    )

    for service in "${!service_endpoints[@]}"; do
        url="${service_endpoints[$service]}"
        

        if [[ "$service" == "redis" ]]; then
            if command -v redis-cli &> /dev/null; then
                if redis-cli -h localhost -p 6379 ping &> /dev/null; then
                    log_success "$service is responding"
                else
                    log_warning "$service is not responding"
                fi
            else
                log_warning "redis-cli not available, skipping Redis connectivity test"
            fi

        elif [[ "$service" == "mongodb" ]]; then
            if command -v mongosh &> /dev/null; then
                if mongosh --host localhost --port 27017 --eval "db.runCommand('ping')" &> /dev/null; then
                    log_success "$service is responding"
                else
                    log_warning "$service is not responding"
                fi
            else
                log_warning "mongosh not available, skipping MongoDB connectivity test"
            fi

        else
            if curl -sf --max-time 5 "$url" > /dev/null 2>&1; then
                log_success "$service is responding at $url"
            else
                log_warning "$service is not responding at $url"
            fi
        fi
    done
}

access_shell() {
    local service=$1
    validate_service "$service" || return 1

    log_info "Accessing shell for $service..."
    if docker compose ps "$service" | grep -q "Up"; then
        docker compose exec "$service" sh
    else
        log_error "$service is not running"
        return 1
    fi
}

debug_service() {
    local service=$1
    validate_service "$service" || return 1

    log_info "Debugging $service..."


    echo "=== Service Status ==="
    docker compose ps "$service"


    echo "=== Recent Logs (last 50 lines) ==="
    docker compose logs --tail=50 "$service"


    echo "=== Resource Usage ==="
    docker stats --no-stream "$service" 2>/dev/null || log_warning "Could not get stats for $service"


    echo "=== Service Configuration ==="
    docker compose config | grep -A 20 "$service:" || true
}

setup_environment() {
    log_info "Setting up environment..."


    if [[ ! -f ".env" ]]; then
        if [[ -f ".env.example" ]]; then
            cp .env.example .env
            log_success "Created .env file from template"
        else
            log_error ".env.example not found"
            return 1
        fi
    fi


    mkdir -p logs
    mkdir -p data/mongodb
    mkdir -p data/redis
    mkdir -p data/rabbitmq


    chmod 755 logs data

    log_info "Please edit the .env file with your configuration:"
    log_info "- SMTP settings for email notifications"
    log_info "- Weather API key"
    log_info "- Other service configurations"

    log_success "Environment setup completed"
}

restart_service() {
    local service=$1
    validate_service "$service" || return 1

    log_info "Restarting $service..."
    if docker compose restart "$service"; then
        log_success "$service restarted successfully"
        sleep 3
        show_status
    else
        log_error "Failed to restart $service"
        return 1
    fi
}

rebuild_service() {
    local service=$1
    validate_service "$service" || return 1

    log_info "Rebuilding and restarting $service..."
    

    docker compose stop "$service"
    

    if docker compose build "$service"; then
        log_success "$service rebuilt successfully"
    else
        log_error "Failed to rebuild $service"
        return 1
    fi
    

    if docker compose up -d "$service"; then
        log_success "$service started successfully"
        sleep 3
        show_status
    else
        log_error "Failed to start $service"
        return 1
    fi
}


case ${1:-help} in
    build)
        check_docker
        build_all
        ;;
    build-service)
        check_docker
        build_service "$2"
        ;;
    up)
        check_docker
        if check_environment; then
            start_all
        fi
        ;;
    up-infra)
        check_docker
        start_infrastructure
        ;;
    down)
        check_docker
        stop_all
        ;;
    logs)
        check_docker
        show_logs
        ;;
    logs-service)
        check_docker
        show_logs "$2"
        ;;
    clean)
        check_docker
        clean_docker
        ;;
    reset)
        check_docker
        reset_data
        ;;
    status)
        check_docker
        show_status
        ;;
    health)
        check_docker
        check_health
        ;;
    shell)
        check_docker
        access_shell "$2"
        ;;
    debug)
        check_docker
        debug_service "$2"
        ;;
    setup)
        setup_environment
        ;;
    restart)
        check_docker
        restart_service "$2"
        ;;
    rebuild)
        check_docker
        rebuild_service "$2"
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        log_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac
