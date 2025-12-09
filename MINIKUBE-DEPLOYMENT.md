# Minikube Deployment Guide

This guide explains how to deploy the Wedding Gifts application to Minikube for local development and testing.

## 📋 Prerequisites

Before running the deployment scripts, ensure you have the following installed:

- **[Minikube](https://minikube.sigs.k8s.io/docs/start/)** - Local Kubernetes cluster
- **[kubectl](https://kubernetes.io/docs/tasks/tools/)** - Kubernetes command-line tool
- **[Docker](https://www.docker.com/products/docker-desktop/)** - Container runtime

## 🚀 Quick Start

### Deploy Everything

Run the all-in-one deployment script:

```powershell
.\deploy-minikube.ps1
```

This script will:

1. ✅ Check prerequisites
2. 🚀 Start Minikube
3. 🐳 Configure Docker environment
4. 📦 Build API and Web Docker images
5. ☸️  Deploy all Kubernetes resources
6. ⏳ Wait for services to be ready
7. 🌱 Seed the database with demo data
8. 🌐 Display service URLs

### Access Your Application

After deployment completes, you'll see the service URLs:

```txt
📍 Service URLs:
   API:  http://192.168.49.2:30080
   Web:  http://192.168.49.2:30081
```

Or open the web app directly:

```powershell
minikube service web -n wedding-gifts
```

## 🎛️ Script Options

### Deploy Script Options

```powershell
# Skip building Docker images (use existing images)
.\deploy-minikube.ps1 -SkipBuild

# Skip database seeding
.\deploy-minikube.ps1 -SkipSeed

# Custom resources (CPUs and Memory)
.\deploy-minikube.ps1 -CPUs 6 -Memory 12288

# Combined options
.\deploy-minikube.ps1 -SkipBuild -SkipSeed
```

### Cleanup Script

Remove deployed resources:

```powershell
# Delete the wedding-gifts namespace and all resources
.\cleanup-minikube.ps1 -DeleteNamespace

# Stop Minikube
.\cleanup-minikube.ps1 -StopMinikube

# Delete Minikube cluster completely
.\cleanup-minikube.ps1 -DeleteMinikube

# Combined: delete resources and stop Minikube
.\cleanup-minikube.ps1 -DeleteNamespace -StopMinikube
```

## 🔍 Monitoring & Debugging

### View Logs

```powershell
# API logs (follow mode)
kubectl logs -n wedding-gifts -l app=api -f

# Web logs (follow mode)
kubectl logs -n wedding-gifts -l app=web -f

# MySQL logs
kubectl logs -n wedding-gifts -l app=mysql -f

# Seed job logs
kubectl logs -n wedding-gifts job/seed-demo
```

### Check Status

```powershell
# View all pods
kubectl get pods -n wedding-gifts

# View all resources
kubectl get all -n wedding-gifts

# Check specific pod details
kubectl describe pod <pod-name> -n wedding-gifts
```

### Kubernetes Dashboard

Open the Kubernetes dashboard in your browser:

```powershell
minikube dashboard
```

## 🏗️ Architecture

The deployment includes:

### Services

| Service | Type | Port | NodePort | Description |
|---------|------|------|----------|-------------|
| **mysql** | ClusterIP | 3306 | - | MySQL database (internal only) |
| **api** | NodePort | 8080 | 30080 | REST API backend |
| **web** | NodePort | 3000 | 30081 | Next.js web frontend |

### Resources Deployed

- **Namespace**: `wedding-gifts`
- **Secrets**: MySQL credentials
- **ConfigMap**: MySQL database name
- **Deployments**: MySQL, API, Web
- **Services**: MySQL (ClusterIP), API (NodePort), Web (NodePort)
- **Job**: Database seed job (optional)

### Environment Variables

#### API Service

- `DB_HOST`: mysql
- `DB_PORT`: 3306
- `DB_USER`: appuser (from secret)
- `DB_PASS`: apppass (from secret)
- `DB_NAME`: wedding_gifts (from configmap)
- `PORT`: 8080

#### Web Service

- `NEXT_PUBLIC_API_BASE_URL`: http://api:8080

## 🔧 Manual Commands

If you prefer to run commands manually:

### 1. Start Minikube

```powershell
minikube start --cpus=4 --memory=8192
```

### 2. Configure Docker

```powershell
minikube docker-env | Invoke-Expression
```

### 3. Build Images

```powershell
docker build -t wedding-registry-api:local -f apps/api/Dockerfile .
docker build -t wedding-registry-web:local -f apps/web/Dockerfile .
```

### 4. Deploy Resources

```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mysql.yaml
kubectl apply -f k8s/api.yaml
kubectl apply -f k8s/web.yaml
```

### 5. Wait for Services

```powershell
kubectl wait --for=condition=ready pod -l app=mysql -n wedding-gifts --timeout=180s
kubectl wait --for=condition=ready pod -l app=api -n wedding-gifts --timeout=180s
kubectl wait --for=condition=ready pod -l app=web -n wedding-gifts --timeout=180s
```

### 6. Seed Database

```powershell
kubectl apply -f k8s/seed-job.yaml
```

### 7. Get URLs

```powershell
minikube service api -n wedding-gifts --url
minikube service web -n wedding-gifts --url
```

## 🐛 Troubleshooting

### Pods Not Starting

Check pod status and events:

```powershell
kubectl get pods -n wedding-gifts
kubectl describe pod <pod-name> -n wedding-gifts
```

### Image Pull Errors

Ensure you're using Minikube's Docker daemon:

```powershell
minikube docker-env | Invoke-Expression
docker images | Select-String "wedding-registry"
```

### Database Connection Issues

Check if MySQL is ready:

```powershell
kubectl get pods -n wedding-gifts -l app=mysql
kubectl logs -n wedding-gifts -l app=mysql
```

### API Health Check Failing

Test the API health endpoint:

```powershell
$apiUrl = minikube service api -n wedding-gifts --url
curl "$apiUrl/health"
```

### Service URLs Not Working

Get Minikube IP and check services:

```powershell
minikube ip
kubectl get svc -n wedding-gifts
```

## 🔄 Updating Deployments

After making code changes:

### Rebuild and Redeploy

```powershell
# Configure Docker
minikube docker-env | Invoke-Expression

# Rebuild images
docker build -t wedding-registry-api:local -f apps/api/Dockerfile .
docker build -t wedding-registry-web:local -f apps/web/Dockerfile .

# Restart deployments
kubectl rollout restart deployment api -n wedding-gifts
kubectl rollout restart deployment web -n wedding-gifts

# Watch rollout status
kubectl rollout status deployment api -n wedding-gifts
kubectl rollout status deployment web -n wedding-gifts
```

### Quick Redeploy Script

Or use the deploy script with skip flags:

```powershell
# Rebuild images and redeploy (skip seed)
.\deploy-minikube.ps1 -SkipSeed
```

## 📊 Resource Requirements

### Recommended Minimum

- **CPUs**: 4
- **Memory**: 8GB
- **Disk**: 20GB

### Adjust Resources

```powershell
# Start with more resources
minikube start --cpus=6 --memory=12288

# Or update existing cluster
minikube stop
minikube delete
minikube start --cpus=6 --memory=12288
```

## 🔐 Security Notes

⚠️ **Important**: The default configuration uses hard-coded credentials for local development:

- MySQL Root Password: `rootpass`
- MySQL User: `appuser`
- MySQL Password: `apppass`

**For production deployments**, you must:
1. Use proper secrets management (e.g., Sealed Secrets, External Secrets Operator)
2. Change all default passwords
3. Enable TLS/SSL for all services
4. Implement proper network policies
5. Use RBAC for access control

## 📚 Additional Resources

- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

## 🤝 Contributing

If you encounter issues or have improvements for the deployment scripts, please open an issue or submit a pull request.

---

**Happy Deploying! 🎉**

