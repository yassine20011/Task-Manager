#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "Task Manager - Setup Script"
echo "========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is installed${NC}"


# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose is installed${NC}"

# Stop any running containers
echo -e "\n${YELLOW}Stopping existing containers...${NC}"
docker compose down

# Build and start services
echo -e "\n${YELLOW}Building and starting services...${NC}"
docker compose up --build -d

# Wait for services to be ready
echo -e "\n${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Check service status
echo -e "\n========================================="
echo "Service Status:"
echo "========================================="
docker compose ps

echo -e "\n========================================="
echo "Setup Complete!"
echo "========================================="
echo -e "${GREEN}Application URLs:${NC}"
echo "  Frontend: http://localhost"
echo "  Backend:  http://localhost:5000"
echo "  Database: localhost:5432"
echo ""
