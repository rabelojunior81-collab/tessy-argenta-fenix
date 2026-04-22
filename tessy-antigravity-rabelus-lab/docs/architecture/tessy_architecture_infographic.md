graph LR
    subgraph "Camada de Percepção (UI/UX)"
        UI[React Components] --> LC[LayoutContext Mediator]
    end

    subgraph "Camada de Cognição (Agnostic AI)"
        LC --> Middleware[Middleware de Sanitização]
        Middleware --> LLM[LLM Engine]
    end

    subgraph "Camada de Soberania (Local-First Storage)"
        LC --> Encrypt[AES-GCM Encryption]
        Encrypt --> DB[(IndexedDB)]
        DB --> Vector[(Vector Store Local)]
    end

    style LC fill:#1a1a1a,stroke:#00ff00,stroke-width:2px
    style DB fill:#1a1a1a,stroke:#00ff00,stroke-width:2px
    style LLM fill:#1a1a1a,stroke:#ff00ff,stroke-width:2px
