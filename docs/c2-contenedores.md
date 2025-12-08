# C2 – Diagrama de contenedores

```mermaid
flowchart LR
    %% Clientes
    subgraph Clients[Clientes]
        Guest[Invitado\nBrowser]
        Couple[Pareja / Admin\nBrowser]
    end

    %% Frontend
    subgraph Frontend[Frontend - Next.js]
        FEApp[App Web\nPúblico + Panel Admin]
    end

    %% Backend
    subgraph Backend[Backend API - Express + Clean Architecture]
        subgraph Presentation[Capa de Presentación]
            HTTPLayer[HTTP Controllers\n+ Auth Middleware\n+ Error Handler]
        end
        
        subgraph Application[Capa de Aplicación]
            UseCases[Use Cases\nOrquestación]
        end
        
        subgraph Domain[Capa de Dominio]
            Entities[Entities & Value Objects]
            Ports[Ports / Interfaces\nRepos + Servicios]
        end
        
        subgraph Infrastructure[Capa de Infraestructura]
            Repos[Repos InMemory]
            Services[Servicios externos simulados Email, Payments, Hash, Tokens]
        end
        
        subgraph Composition[Composition Root]
            Container[DI Container]
            AppFactory[createApp]
        end
    end

    %% Externos
    subgraph External[Servicios Externos]
        MPago[MercadoPago\nPreferencias + Webhooks]
        Mail[Proveedor Email]
    end

    %% Flujos
    Guest --> FEApp
    Couple --> FEApp
    FEApp -->|REST / JSON| HTTPLayer
    HTTPLayer --> UseCases
    UseCases --> Entities
    UseCases --> Ports
    Ports -.->|implements| Repos
    Ports -.->|implements| Services

    Services --> MPago
    Services --> Mail

    MPago -->|Webhooks| HTTPLayer
```

## Principios de Clean Architecture

- **Dependency Rule**: Las dependencias apuntan hacia adentro (Infrastructure → Application → Domain)
- **Domain Layer**: Contiene entidades, value objects y reglas de negocio puras
- **Application Layer**: Contiene use cases que orquestan el flujo de la aplicación
- **Infrastructure Layer**: Implementaciones concretas de repositorios y servicios externos simulados
- **Ports & Adapters**: Los use cases dependen de interfaces (ports), no de implementaciones concretas
