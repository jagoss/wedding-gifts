# 🚀 Quick Start Guide

Deploy your Wedding Gifts application to Minikube in 3 simple steps!

## ⚡ The Fastest Way

```powershell
# 1. Deploy everything
.\deploy-minikube.ps1

# 2. Open the web app
minikube service web -n wedding-gifts

# 3. That's it! 🎉
```

## 📦 What Gets Deployed?

```txt
┌─────────────────────────────────────────────┐
│             Minikube Cluster                │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  MySQL   │  │   API    │  │   Web    │   │
│  │          │  │          │  │          │   │
│  │  :3306   │◄─┤  :8080   │◄─┤  :3000   │   │
│  │(Internal)│  │(NodePort)│  │(NodePort)│   │
│  └──────────┘  └──────────┘  └──────────┘   │
│                                             │
│  🌱 Demo data seeded automatically          │
└─────────────────────────────────────────────┘
```

## 🎯 Access URLs

After deployment, you'll get URLs like:

- **Web App**: `http://192.168.49.2:30081` (varies by system)
- **API**: `http://192.168.49.2:30080`

## 🎬 What Happens During Deployment?

The `deploy-minikube.ps1` script automatically:

1. ✅ **Validates** - Checks for Minikube, kubectl, Docker
2. 🚀 **Starts** - Launches Minikube with 4 CPUs and 8GB RAM
3. 🐳 **Builds** - Creates Docker images for API and Web
4. ☸️ **Deploys** - Applies all Kubernetes manifests
5. ⏳ **Waits** - Ensures all pods are healthy
6. 🌱 **Seeds** - Populates demo data (demo-wedding)
7. 🌐 **Reports** - Shows you the access URLs

**Estimated time**: ~5-10 minutes (depending on your machine)

## 🧪 Demo Credentials

After seeding, you can login with:

- **Email**: `demo.admin@example.com`
- **Password**: `demo1234`
- **Wedding slug**: `demo-wedding`

## 🛠️ Common Commands

### View Logs

```powershell
# API logs
kubectl logs -n wedding-gifts -l app=api -f

# Web logs
kubectl logs -n wedding-gifts -l app=web -f

# All pods status
kubectl get pods -n wedding-gifts
```

### Access Services

```powershell
# Get service URLs
minikube service list -n wedding-gifts

# Open web app in browser
minikube service web -n wedding-gifts

# Open Kubernetes dashboard
minikube dashboard
```

### Rebuild After Changes

```powershell
# Redeploy without re-seeding
.\deploy-minikube.ps1 -SkipSeed

# Or use manual rebuild
minikube docker-env | Invoke-Expression
docker build -t wedding-registry-api:local -f apps/api/Dockerfile .
kubectl rollout restart deployment api -n wedding-gifts
```

### Cleanup

```powershell
# Remove all resources
.\cleanup-minikube.ps1 -DeleteNamespace

# Stop Minikube
.\cleanup-minikube.ps1 -StopMinikube

# Full cleanup (includes deleting cluster)
.\cleanup-minikube.ps1 -DeleteNamespace -DeleteMinikube
```

## 📚 Need More Details?

- **Full deployment guide**: [MINIKUBE-DEPLOYMENT.md](MINIKUBE-DEPLOYMENT.md)
- **Project README**: [README.md](README.md)
- **API testing**: See `apps/api/api-tests.http`

## 🐛 Something Wrong?

### Pods Not Starting?

```powershell
kubectl get pods -n wedding-gifts
kubectl describe pod <pod-name> -n wedding-gifts
kubectl logs -n wedding-gifts <pod-name>
```

### Can't Access Services?

```powershell
# Check if Minikube is running
minikube status

# Get Minikube IP
minikube ip

# Check services
kubectl get svc -n wedding-gifts
```

### Image Not Found?

Make sure you're using Minikube's Docker daemon:

```powershell
minikube docker-env | Invoke-Expression
docker images | Select-String "wedding-registry"
```

## 🎓 Using npm Scripts

You can also use npm scripts instead of running PowerShell directly:

```bash
# Deploy
npm run k8s:deploy

# Cleanup
npm run k8s:cleanup
```

## 💡 Pro Tips

1. **Increase resources** if you have a powerful machine:

   ```powershell
   .\deploy-minikube.ps1 -CPUs 6 -Memory 12288
   ```

2. **Skip builds** when only updating configuration:

   ```powershell
   .\deploy-minikube.ps1 -SkipBuild
   ```

3. **Monitor in real-time** using Kubernetes dashboard:

   ```powershell
   minikube dashboard
   ```

4. **Port forwarding** for direct pod access:

   ```powershell
   kubectl port-forward -n wedding-gifts service/api 8080:8080
   ```

---

### Happy coding! 🎉
