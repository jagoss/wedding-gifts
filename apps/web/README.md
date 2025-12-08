# Web (Next.js + TypeScript)

Frontend responsive para la lista de regalos. Incluye Chakra UI, React Query y formularios con React Hook Form + Zod.

## Requisitos

- Node 18+
- Variables de entorno en `.env.local`:

  ```txt
  NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
  ```

## Scripts

- `npm run dev --workspace @wedding-registry/web` – servidor de desarrollo.
- `npm run build --workspace @wedding-registry/web` – build de producción.
- `npm run lint --workspace @wedding-registry/web` – lint.
- `npm run test --workspace @wedding-registry/web` – tests con Vitest + RTL.

## Estructura de carpetas

- `src/app` – rutas (App Router). `layout.tsx` registra providers globales.
- `src/core` – modelos de dominio y repositorios (puertos).
- `src/lib` – clientes compartidos (HTTP, QueryClient, storage).
- `src/ui` – componentes, hooks y sesión.

## Onboarding rápido (si eres nuevo en frontend)

1. **Instala dependencias**: en la raíz del monorepo, `npm install`.
2. **Crea `.env.local`** en `apps/web` con el `NEXT_PUBLIC_API_BASE_URL`.
3. **Corre en dev**: `npm run dev --workspace @wedding-registry/web` y abre `http://localhost:3000`.
4. **Modifica una página**: revisa `src/app/page.tsx` (landing) o `src/app/weddings/[slug]/page.tsx` (vista pública).
5. **Llamadas a API**: usa los hooks (`usePublicWedding`, `useWeddings`, etc.) que ya hablan con el backend.
6. **Estilos**: Chakra UI está disponible (componentes pre-armados). Tailwind está configurado por si necesitas utilidades rápidas.
7. **Tests**: ejecuta `npm run test --workspace @wedding-registry/web`. Los tests viven en `src/__tests__`.

## Notas de arquitectura

- **Clean/DDD light**: modelos en `core/domain`, puertos en `core/domain/repositories`, adapters HTTP en `core/infrastructure/http`.
- **Estado remoto**: React Query centraliza fetch/cache e invalidaciones.
- **DX**: hooks y repos ya inyectan el `baseUrl` y token guardado en `localStorage`.

## Troubleshooting

- Si ves errores de CORS o 401, confirma que el backend corre en el `NEXT_PUBLIC_API_BASE_URL` y que hiciste login en `/login` para endpoints protegidos.
- Para restablecer la sesión, limpia `localStorage` o usa el botón “Salir” del navbar.
