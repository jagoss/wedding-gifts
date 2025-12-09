# 🌐 Acceso a Servicios Externos

Esta guía explica cómo acceder a tu aplicación Wedding Gifts desplegada en Minikube desde tu máquina local.

## 🚀 Despliegue Automático con Puertos Expuestos

### Método 1: Despliegue Completo (Recomendado)

Ejecuta el script de despliegue completo que automáticamente expone los puertos:

```powershell
.\deploy-minikube.ps1
```

Este script:

1. ✅ Despliega toda la aplicación
2. ✅ Crea las tablas de base de datos
3. ✅ Inserta datos de prueba
4. ✅ **Automáticamente abre dos ventanas de PowerShell** con port-forwarding
5. ✅ Te da acceso inmediato en `localhost`

**URLs de acceso:**

- API: `http://localhost:8080`
- Web: `http://localhost:3000`

### Método 2: Solo Iniciar Port-Forwarding

Si los servicios ya están desplegados pero cerraste las ventanas de port-forwarding:

```powershell
.\start-services.ps1
```

O usando npm:

```powershell
npm run k8s:start
```

Este script:

- ✅ Verifica que los servicios estén corriendo
- ✅ Abre dos ventanas de PowerShell automáticamente
- ✅ Crea túneles port-forward para API y Web
- ✅ Abre el navegador automáticamente

## 📋 Cómo Funciona

### Port-Forwarding Automático

El script crea dos túneles persistentes usando `kubectl port-forward`:

```powershell
# API
kubectl port-forward -n wedding-gifts service/api 8080:8080

# Web
kubectl port-forward -n wedding-gifts service/web 3000:3000
```

Estos túneles permiten que:

- `http://localhost:8080` → API dentro de Kubernetes
- `http://localhost:3000` → Web dentro de Kubernetes

### Ventanas Separadas

Los port-forwards se ejecutan en ventanas de PowerShell separadas para que:

- ✅ Puedas ver el estado de cada túnel
- ✅ No bloqueen tu terminal principal
- ✅ Puedas cerrarlas individualmente cuando termines

## 🧪 Probar la API

### Health Check

```powershell
curl http://localhost:8080/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "timestamp": "2024-12-09T..."
}
```

### Obtener Boda de Demostración

```powershell
curl http://localhost:8080/public/weddings/demo-wedding
```

### Login

```powershell
curl -X POST http://localhost:8080/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"demo.admin@example.com\",\"password\":\"demo1234\"}'
```

## 🌐 Acceder a la Aplicación Web

1. **Automático**: El script `start-services.ps1` abre el navegador automáticamente
2. **Manual**: Visita `http://localhost:3000`

### Credenciales de Demo

- **Email**: `demo.admin@example.com`
- **Password**: `demo1234`
- **Boda demo**: slug `demo-wedding`

## 🔄 Reiniciar Port-Forwarding

Si cerraste las ventanas por accidente:

```powershell
# Opción 1: Script completo
.\start-services.ps1

# Opción 2: npm script
npm run k8s:start

# Opción 3: Manual (una ventana por servicio)
kubectl port-forward -n wedding-gifts service/api 8080:8080
kubectl port-forward -n wedding-gifts service/web 3000:3000
```

## 🛑 Detener Port-Forwarding

Simplemente cierra las ventanas de PowerShell que están ejecutando los port-forwards.

O desde la línea de comandos:

```powershell
# Encontrar procesos de port-forward
Get-Process | Where-Object {$_.CommandLine -like "*port-forward*"}

# Matar procesos específicos (reemplaza PID con el ID del proceso)
Stop-Process -Id <PID>
```

## ⚙️ Configuración Alternativa: NodePort

Los servicios también están configurados con NodePort:

- API: NodePort 30080
- Web: NodePort 30081

Para usarlos directamente con Minikube IP:

```powershell
# Obtener IP de Minikube
minikube ip

# Acceder directamente (reemplaza <MINIKUBE-IP>)
# API:  http://<MINIKUBE-IP>:30080
# Web:  http://<MINIKUBE-IP>:30081
```

## 🔍 Verificar Estado de los Servicios

```powershell
# Ver todos los pods
kubectl get pods -n wedding-gifts

# Ver todos los servicios
kubectl get svc -n wedding-gifts

# Ver logs en tiempo real
kubectl logs -n wedding-gifts -l app=api -f
kubectl logs -n wedding-gifts -l app=web -f
```

## 🐛 Solución de Problemas

### Error: "Connection Refused"

1. Verifica que los port-forwards estén corriendo:

   ```powershell
   Get-Process | Where-Object {$_.CommandLine -like "*port-forward*"}
   ```

2. Reinicia el port-forwarding:

   ```powershell
   .\start-services.ps1
   ```

### Error: "Port already in use"

Algo más está usando el puerto 8080 o 3000:

```powershell
# Ver qué está usando el puerto
netstat -ano | findstr :8080
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID)
Stop-Process -Id <PID>
```

### Los servicios no responden

Verifica que los pods estén corriendo:

```powershell
kubectl get pods -n wedding-gifts

# Si no están ready, revisa los logs
kubectl logs -n wedding-gifts -l app=api
kubectl logs -n wedding-gifts -l app=web
```

## 📚 Comandos Útiles

```powershell
# Desplegar todo
.\deploy-minikube.ps1

# Iniciar port-forwarding
.\start-services.ps1

# Ver estado
kubectl get all -n wedding-gifts

# Ver logs
kubectl logs -n wedding-gifts -l app=api -f

# Dashboard de Kubernetes
minikube dashboard

# Limpiar todo
.\cleanup-minikube.ps1 -DeleteNamespace
```

## 🎯 Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| **Desplegar** | `.\deploy-minikube.ps1` | Despliega toda la aplicación |
| **Iniciar servicios** | `.\start-services.ps1` | Inicia port-forwarding |
| **Limpiar** | `.\cleanup-minikube.ps1` | Elimina el despliegue |

### NPM Scripts

```bash
npm run k8s:deploy   # Desplegar
npm run k8s:start    # Iniciar port-forwarding
npm run k8s:cleanup  # Limpiar
```

## 💡 Mejores Prácticas

1. **Mantén las ventanas de port-forward abiertas** mientras usas la aplicación
2. **Usa `start-services.ps1`** después de reiniciar tu computadora
3. **Revisa los logs** si algo no funciona: `kubectl logs -n wedding-gifts -l app=api -f`
4. **No uses puertos 8080 y 3000** para otras aplicaciones mientras trabajas con este proyecto

---

### ¡Disfruta tu aplicación Wedding Gifts! 🎉
