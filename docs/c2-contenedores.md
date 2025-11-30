# C2 – Diagrama de contenedores

```mermaid
flowchart LR
    %% Clientes
    subgraph Clients[Clientes]
        Guest[Invitado\nWeb Browser]
        Couple[Pareja / Admin\nWeb Browser]
    end

    %% Frontend
    subgraph Frontend[Frontend - Next.js + TypeScript]
        FEApp[App Web\nPublic pages + Admin panel]
    end

    %% Backend - Clean Architecture
    subgraph Backend[Backend API - Clean Architecture]
        subgraph Presentation[Capa de Presentación]
            HTTPLayer[HTTP Controllers\nExpress.js]
        end
        
        subgraph Application[Capa de Aplicación]
            UseCases[Use Cases\nOrquestación de negocio]
        end
        
        subgraph Domain[Capa de Dominio]
            Entities[Entities & Value Objects\nReglas de negocio]
            Ports[Ports / Interfaces\nContratos]
        end
        
        subgraph Infrastructure[Capa de Infraestructura]
            Repos[Repository Implementations]
            ExtServices[External Service Adapters]
        end
    end

    %% Infra
    subgraph Infra[Infraestructura]
        DB[(PostgreSQL)]
        Cache[(Redis)]
        Storage[(Object Storage\nS3 / R2)]
        Mail[Email Provider]
        Logs[(Logging / Metrics)]
    end

    %% Externos
    subgraph External[APIs externas]
        AmazonAPI[Amazon Product\nAdvertising API]
        MLAPI[MercadoLibre\nItems API]
        MPago[MercadoPago\nCheckout + Webhooks]
    end

    %% Navegadores -> Frontend
    Guest --> FEApp
    Couple --> FEApp

    %% Frontend -> Backend
    FEApp -->|REST / JSON| HTTPLayer

    %% Clean Architecture flow (outside-in)
    HTTPLayer --> UseCases
    UseCases --> Entities
    UseCases --> Ports
    Ports -.->|implements| Repos
    Ports -.->|implements| ExtServices

    %% Infrastructure -> External
    Repos --> DB
    Repos --> Cache
    ExtServices --> Mail
    ExtServices --> MPago
    ExtServices --> AmazonAPI
    ExtServices --> MLAPI

    %% Storage
    FEApp --> Storage

    %% Webhooks
    MPago -->|Webhooks| HTTPLayer

    %% Logs
    HTTPLayer --> Logs
    UseCases --> Logs
```

## Principios de Clean Architecture

- **Dependency Rule**: Las dependencias apuntan hacia adentro (Infrastructure → Application → Domain)
- **Domain Layer**: Contiene entidades, value objects y reglas de negocio puras
- **Application Layer**: Contiene use cases que orquestan el flujo de la aplicación
- **Infrastructure Layer**: Implementaciones concretas de repositorios y servicios externos
- **Ports & Adapters**: Los use cases dependen de interfaces (ports), no de implementaciones concretas
