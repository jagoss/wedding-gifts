#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Deploy Wedding Gifts application to Minikube
.DESCRIPTION
    This script automates the complete deployment process:
    - Starts Minikube
    - Builds Docker images
    - Deploys Kubernetes resources
    - Seeds the database
    - Provides access URLs
.EXAMPLE
    .\deploy-minikube.ps1
#>

param(
    [switch]$SkipBuild,
    [switch]$SkipSeed,
    [int]$CPUs = 4,
    [int]$Memory = 8192
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n[*] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Banner
Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "                                                            " -ForegroundColor Magenta
Write-Host "         Wedding Gifts - Minikube Deployment                " -ForegroundColor Magenta
Write-Host "                                                            " -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host ""

# Step 1: Check prerequisites
Write-Step "Checking prerequisites..."
try {
    $null = Get-Command minikube -ErrorAction Stop
    Write-Success "Minikube is installed"
} catch {
    Write-Error-Custom "Minikube is not installed. Please install it first."
    Write-Info "Visit: https://minikube.sigs.k8s.io/docs/start/"
    exit 1
}

try {
    $null = Get-Command kubectl -ErrorAction Stop
    Write-Success "kubectl is installed"
} catch {
    Write-Error-Custom "kubectl is not installed. Please install it first."
    exit 1
}

try {
    $null = Get-Command docker -ErrorAction Stop
    Write-Success "Docker is installed"
    
    # Check if Docker is running
    $dockerVersion = docker version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Docker is installed but not running."
        Write-Info "Please start Docker Desktop and try again."
        exit 1
    }
    Write-Success "Docker is running"
} catch {
    Write-Error-Custom "Docker is not installed. Please install it first."
    exit 1
}

# Step 2: Start Minikube
Write-Step "Starting Minikube (CPUs: $CPUs, Memory: ${Memory}MB)..."

# Check Minikube status (suppress errors for new installations)
$minikubeStatus = $null
try {
    $statusOutput = minikube status 2>&1 | Out-String
    if ($statusOutput -match "host:\s*Running" -or $statusOutput -match "Running") {
        $minikubeStatus = "Running"
    }
} catch {
    # Minikube not initialized yet, that's OK
}

if ($minikubeStatus -eq "Running") {
    Write-Info "Minikube is already running"
} else {
    Write-Host "  Starting Minikube cluster..." -ForegroundColor White
    Write-Info "This may take a few minutes on first run..."
    
    # Try to start Minikube with Docker driver
    minikube start --cpus=$CPUs --memory=$Memory --driver=docker
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to start Minikube"
        Write-Info "If you see Docker-related errors, try:"
        Write-Info "  1. Make sure Docker Desktop is running"
        Write-Info "  2. Run: minikube delete"
        Write-Info "  3. Run this script again"
        exit 1
    }
    Write-Success "Minikube started successfully"
}

# Step 3: Configure Docker environment
Write-Step "Configuring Docker to use Minikube's daemon..."
try {
    $dockerEnvOutput = & minikube -p minikube docker-env --shell powershell 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to get Docker environment from Minikube"
        Write-Info "Error: $dockerEnvOutput"
        exit 1
    }
    
    # Parse and set environment variables
    foreach ($line in $dockerEnvOutput) {
        if ($line -match '^\$Env:(\w+) = "(.+)"$') {
            $varName = $matches[1]
            $varValue = $matches[2]
            Set-Item -Path "Env:$varName" -Value $varValue
            Write-Host "  Set $varName" -ForegroundColor Gray
        }
    }
    
    Write-Success "Docker environment configured"
} catch {
    Write-Error-Custom "Failed to configure Docker environment: $_"
    exit 1
}

# Step 4: Build Docker images
if (-not $SkipBuild) {
    Write-Step "Building Docker images..."
    
    Write-Host "  [BUILD] Building API image..." -ForegroundColor White
    docker build -t wedding-registry-api:local -f apps/api/Dockerfile .
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to build API image"
        exit 1
    }
    Write-Success "API image built"
    
    Write-Host "  [BUILD] Building Web image..." -ForegroundColor White
    docker build -t wedding-registry-web:local -f apps/web/Dockerfile .
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to build Web image"
        exit 1
    }
    Write-Success "Web image built"
} else {
    Write-Info "Skipping image build (--SkipBuild flag)"
}

# Step 5: Deploy Kubernetes resources
Write-Step "Deploying Kubernetes resources..."

Write-Host "  [K8S] Creating namespace..." -ForegroundColor White
kubectl apply -f k8s/namespace.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Failed to create namespace"
    exit 1
}

Write-Host "  [K8S] Deploying MySQL..." -ForegroundColor White
kubectl apply -f k8s/mysql.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Failed to deploy MySQL"
    exit 1
}

Write-Host "  [K8S] Deploying API..." -ForegroundColor White
kubectl apply -f k8s/api.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Failed to deploy API"
    exit 1
}

Write-Host "  [K8S] Deploying Web..." -ForegroundColor White
kubectl apply -f k8s/web.yaml
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Failed to deploy Web"
    exit 1
}

Write-Success "All resources deployed"

# Step 6: Wait for pods to be ready
Write-Step "Waiting for services to be ready..."

Write-Host "  [WAIT] Waiting for MySQL..." -ForegroundColor White
kubectl wait --for=condition=ready pod -l app=mysql -n wedding-gifts --timeout=180s
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "MySQL pod failed to become ready"
    Write-Info "Check logs with: kubectl logs -n wedding-gifts -l app=mysql"
    exit 1
}
Write-Success "MySQL is ready"

Write-Host "  [WAIT] Waiting for API..." -ForegroundColor White
kubectl wait --for=condition=ready pod -l app=api -n wedding-gifts --timeout=180s
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "API pod failed to become ready"
    Write-Info "Check logs with: kubectl logs -n wedding-gifts -l app=api"
    exit 1
}
Write-Success "API is ready"

Write-Host "  [WAIT] Waiting for Web..." -ForegroundColor White
kubectl wait --for=condition=ready pod -l app=web -n wedding-gifts --timeout=180s
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Web pod failed to become ready"
    Write-Info "Check logs with: kubectl logs -n wedding-gifts -l app=web"
    exit 1
}
Write-Success "Web is ready"

# Step 7: Seed database
if (-not $SkipSeed) {
    Write-Step "Seeding database with demo data..."
    
    # Delete existing seed job if it exists
    kubectl delete job seed-demo -n wedding-gifts 2>$null | Out-Null
    
    kubectl apply -f k8s/seed-job.yaml
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to create seed job"
        exit 1
    }
    
    # Wait for job to complete
    Write-Host "  [WAIT] Waiting for seed job to complete..." -ForegroundColor White
    $timeout = 120
    $elapsed = 0
    $interval = 5
    
    while ($elapsed -lt $timeout) {
        $succeeded = kubectl get job seed-demo -n wedding-gifts -o jsonpath="{.status.succeeded}" 2>$null
        if ($succeeded -eq "1") {
            Write-Success "Database seeded successfully"
            break
        }
        
        $failed = kubectl get job seed-demo -n wedding-gifts -o jsonpath="{.status.failed}" 2>$null
        if ($failed -ge "1") {
            Write-Error-Custom "Seed job failed"
            Write-Info "Check logs with: kubectl logs -n wedding-gifts job/seed-demo"
            exit 1
        }
        
        Start-Sleep -Seconds $interval
        $elapsed += $interval
    }
    
    if ($elapsed -ge $timeout) {
        Write-Info "Seed job is still running. Check status with: kubectl get job seed-demo -n wedding-gifts"
    }
} else {
    Write-Info "Skipping database seed (--SkipSeed flag)"
}

# Step 8: Setup service access
Write-Step "Setting up service access..."

# Display summary
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "                                                            " -ForegroundColor Green
Write-Host "                 Deployment Complete!                       " -ForegroundColor Green
Write-Host "                                                            " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

Write-Host "[INFO] Starting port-forwarding for easy access..." -ForegroundColor Cyan
Write-Host ""

# Start port-forwarding in background
Write-Host "  Opening API port-forward (localhost:8080)..." -ForegroundColor White
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host 'API Port Forward - Keep this window open' -ForegroundColor Green; Write-Host 'API available at: http://localhost:8080' -ForegroundColor Cyan; kubectl port-forward -n wedding-gifts service/api 8080:8080"
) -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "  Opening Web port-forward (localhost:3000)..." -ForegroundColor White
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host 'Web Port Forward - Keep this window open' -ForegroundColor Green; Write-Host 'Web available at: http://localhost:3000' -ForegroundColor Cyan; kubectl port-forward -n wedding-gifts service/web 3000:3000"
) -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host ""
Write-Success "Port forwarding started in separate windows"

Write-Host "`n[URLS] Access your services at:" -ForegroundColor Cyan
Write-Host "   API:  http://localhost:8080" -ForegroundColor White
Write-Host "   Web:  http://localhost:3000" -ForegroundColor White

Write-Host "`n[TEST] Quick API tests:" -ForegroundColor Cyan
Write-Host "   Health:        curl http://localhost:8080/health" -ForegroundColor White
Write-Host "   Demo Wedding:  curl http://localhost:8080/public/weddings/demo-wedding" -ForegroundColor White

Write-Host "`n[LOGIN] Demo credentials:" -ForegroundColor Cyan
Write-Host "   Email:    demo.admin@example.com" -ForegroundColor White
Write-Host "   Password: demo1234" -ForegroundColor White

Write-Host "`n[HELP] Useful Commands:" -ForegroundColor Cyan
Write-Host "   View all pods:     kubectl get pods -n wedding-gifts" -ForegroundColor White
Write-Host "   View API logs:     kubectl logs -n wedding-gifts -l app=api -f" -ForegroundColor White
Write-Host "   View Web logs:     kubectl logs -n wedding-gifts -l app=web -f" -ForegroundColor White
Write-Host "   Restart services:  .\start-services.ps1" -ForegroundColor White
Write-Host "   Open dashboard:    minikube dashboard" -ForegroundColor White
Write-Host "   Delete deployment: kubectl delete namespace wedding-gifts" -ForegroundColor White

Write-Host "`n[INFO] Two PowerShell windows opened for port-forwarding" -ForegroundColor Yellow
Write-Host "[INFO] Keep those windows open while using the application" -ForegroundColor Yellow

Write-Host ""

