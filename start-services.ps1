#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start port-forwarding for Wedding Gifts services
.DESCRIPTION
    Creates port-forward tunnels to access the API and Web services
    from localhost without needing minikube service command
.EXAMPLE
    .\start-services.ps1
#>

$ErrorActionPreference = "Stop"

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

# Banner
Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "                                                            " -ForegroundColor Magenta
Write-Host "         Wedding Gifts - Service Port Forwarding            " -ForegroundColor Magenta
Write-Host "                                                            " -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host ""

# Check if namespace exists
$namespaceExists = kubectl get namespace wedding-gifts 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Namespace 'wedding-gifts' not found." -ForegroundColor Red
    Write-Host "[INFO] Please run .\deploy-minikube.ps1 first" -ForegroundColor Yellow
    exit 1
}

# Check if services are ready
Write-Info "Checking if services are ready..."
$apiReady = kubectl wait --for=condition=ready pod -l app=api -n wedding-gifts --timeout=5s 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] API service is not ready" -ForegroundColor Red
    Write-Host "[INFO] Run: kubectl get pods -n wedding-gifts" -ForegroundColor Yellow
    exit 1
}

$webReady = kubectl wait --for=condition=ready pod -l app=web -n wedding-gifts --timeout=5s 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Web service is not ready" -ForegroundColor Red
    Write-Host "[INFO] Run: kubectl get pods -n wedding-gifts" -ForegroundColor Yellow
    exit 1
}

Write-Success "All services are ready"

# Start port-forwarding in new windows
Write-Info "Starting port-forwarding for API on port 8080..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host 'API Port Forward - Keep this window open' -ForegroundColor Green; kubectl port-forward -n wedding-gifts service/api 8080:8080"
)

Start-Sleep -Seconds 2

Write-Info "Starting port-forwarding for Web on port 3000..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host 'Web Port Forward - Keep this window open' -ForegroundColor Green; kubectl port-forward -n wedding-gifts service/web 3000:3000"
)

Start-Sleep -Seconds 3

# Display access information
Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "                                                            " -ForegroundColor Green
Write-Host "                Services are now accessible!                " -ForegroundColor Green
Write-Host "                                                            " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

Write-Host "[URLS] Access your services at:" -ForegroundColor Cyan
Write-Host "   API:  http://localhost:8080" -ForegroundColor White
Write-Host "   Web:  http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "[TEST] Quick API tests:" -ForegroundColor Cyan
Write-Host "   Health:        curl http://localhost:8080/health" -ForegroundColor White
Write-Host "   Demo Wedding:  curl http://localhost:8080/public/weddings/demo-wedding" -ForegroundColor White
Write-Host ""

Write-Host "[LOGIN] Demo credentials:" -ForegroundColor Cyan
Write-Host "   Email:    demo.admin@example.com" -ForegroundColor White
Write-Host "   Password: demo1234" -ForegroundColor White
Write-Host ""

Write-Host "[INFO] Two new PowerShell windows have opened for port-forwarding" -ForegroundColor Yellow
Write-Host "[INFO] Keep those windows open while using the application" -ForegroundColor Yellow
Write-Host "[INFO] Close them when you're done to stop the tunnels" -ForegroundColor Yellow
Write-Host ""

Write-Host "[WEB] Opening web browser..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

Write-Host ""
Write-Success "Setup complete! Enjoy your application!"
Write-Host ""

