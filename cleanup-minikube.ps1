#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Cleanup Wedding Gifts application from Minikube
.DESCRIPTION
    This script removes all deployed resources and optionally stops/deletes Minikube
.PARAMETER DeleteNamespace
    Delete the wedding-gifts namespace and all resources within it
.PARAMETER StopMinikube
    Stop the Minikube cluster
.PARAMETER DeleteMinikube
    Delete the Minikube cluster completely
.EXAMPLE
    .\cleanup-minikube.ps1 -DeleteNamespace
.EXAMPLE
    .\cleanup-minikube.ps1 -DeleteNamespace -StopMinikube
.EXAMPLE
    .\cleanup-minikube.ps1 -DeleteNamespace -DeleteMinikube
#>

param(
    [switch]$DeleteNamespace = $false,
    [switch]$StopMinikube = $false,
    [switch]$DeleteMinikube = $false
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

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

# Banner
Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "                                                            " -ForegroundColor Magenta
Write-Host "           Wedding Gifts - Minikube Cleanup                 " -ForegroundColor Magenta
Write-Host "                                                            " -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host ""

# If no flags provided, show help
if (-not $DeleteNamespace -and -not $StopMinikube -and -not $DeleteMinikube) {
    Write-Host "Usage:" -ForegroundColor Cyan
    Write-Host "  .\cleanup-minikube.ps1 -DeleteNamespace         # Delete deployed resources" -ForegroundColor White
    Write-Host "  .\cleanup-minikube.ps1 -StopMinikube            # Stop Minikube" -ForegroundColor White
    Write-Host "  .\cleanup-minikube.ps1 -DeleteMinikube          # Delete Minikube cluster" -ForegroundColor White
    Write-Host "  .\cleanup-minikube.ps1 -DeleteNamespace -StopMinikube    # Combined" -ForegroundColor White
    Write-Host ""
    Write-Host "Available flags:" -ForegroundColor Cyan
    Write-Host "  -DeleteNamespace   Delete the wedding-gifts namespace and all resources" -ForegroundColor White
    Write-Host "  -StopMinikube      Stop the Minikube cluster" -ForegroundColor White
    Write-Host "  -DeleteMinikube    Delete the Minikube cluster completely" -ForegroundColor White
    Write-Host ""
    exit 0
}

# Delete namespace
if ($DeleteNamespace) {
    Write-Step "Deleting wedding-gifts namespace..."
    
    $namespaceExists = kubectl get namespace wedding-gifts 2>$null
    if ($LASTEXITCODE -eq 0) {
        kubectl delete namespace wedding-gifts
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Namespace deleted successfully"
        } else {
            Write-Warning-Custom "Failed to delete namespace"
        }
    } else {
        Write-Warning-Custom "Namespace 'wedding-gifts' does not exist"
    }
}

# Stop Minikube
if ($StopMinikube) {
    Write-Step "Stopping Minikube..."
    
    $minikubeStatus = minikube status --format='{{.Host}}' 2>$null
    if ($minikubeStatus -eq "Running") {
        minikube stop
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Minikube stopped successfully"
        } else {
            Write-Warning-Custom "Failed to stop Minikube"
        }
    } else {
        Write-Warning-Custom "Minikube is not running"
    }
}

# Delete Minikube
if ($DeleteMinikube) {
    Write-Step "Deleting Minikube cluster..."
    Write-Warning-Custom "This will delete all data in Minikube!"
    
    $confirmation = Read-Host "Are you sure you want to delete the Minikube cluster? (yes/no)"
    if ($confirmation -eq "yes") {
        minikube delete
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Minikube cluster deleted successfully"
        } else {
            Write-Warning-Custom "Failed to delete Minikube cluster"
        }
    } else {
        Write-Warning-Custom "Minikube deletion cancelled"
    }
}

Write-Host "`n[OK] Cleanup complete!`n" -ForegroundColor Green

