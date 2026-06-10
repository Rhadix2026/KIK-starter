# KIK-Starter — Rhadix-editie

Een herbouw van de officiële **ZIN KIK-V Starter** in de **Rhadix-stack**
(React/Vite · FastAPI · PostgreSQL · Fuseki · Docker), met de Rhadix huisstijl.

> Status: **mijlpaal 3 — opvraag-flow**. Naast de shell (m1) en het multi-tenant
> gebruikersbeheer (m2) is nu de kern beschikbaar: uitwisselprofielen kiezen,
> indicatoren opvragen bij geregistreerde zorgaanbieders via hun (gesimuleerde)
> datastation, en resultaten inzien/exporteren (CSV/Excel/API).

## Stack
| Laag | Technologie |
|------|-------------|
| Frontend | React 18 + Vite, React Router, Oxanium-font, Rhadix-palet |
| Backend | FastAPI (Python 3.12) |
| Database | PostgreSQL 16 |
| Triple store | Apache Jena Fuseki 5.1 |
| Deploy | Docker / docker-compose |

## Lokaal draaien
```bash
# volledige stack (frontend, backend, db, fuseki)
docker compose up -d --build
# frontend: http://localhost:5173   ·   backend: http://localhost:8000/api/health
```

Of los, voor ontwikkeling:
```bash
# backend
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
# frontend
cd frontend && npm install && npm run dev
```

## Structuur
```
KIK-starter/
├─ frontend/         React/Vite app (Rhadix UI-shell)
│  └─ src/
│     ├─ components/ Brand (KIK-logo), UI (Nav, Card, Button…)
│     ├─ pages/      Login, Home, QueryFlow, Registration, Results
│     └─ services/   api.js
├─ backend/          FastAPI (health, meta + toekomstige KIK-routers)
└─ docker-compose.yml
```

## Modules (gepland)
- **Opvragen** — dataset → zorgaanbieders → uitwisselprofiel → SPARQL → resultaten
- **Beheer / Registratie** — organisaties, endpoints, DID
- **Resultaten** — inzien, vergelijken, exporteren

Gebaseerd op de ZIN KIK-V Starter (`nl.kik.starter`) en de KIK-V Beheermodule.
