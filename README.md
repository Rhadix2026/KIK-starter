# Rhadix Uitvraag

De afnemer-applicatie binnen het KIK-V-stelsel (opvolger van de ZIN KIK-V Starter), in de **Rhadix-stack**
(React/Vite · FastAPI · PostgreSQL · Fuseki · Docker), met de Rhadix huisstijl.

> Status: **mijlpaal 5 — analyse & monitor**. Naast de shell (m1), het multi-tenant
> gebruikersbeheer (m2) en de opvraag-flow (m3) staat nu de afnemer-app als
> **Rhadix Uitvraag** (m4) met een **Analyse/Monitor**-dashboard (m5): volumes,
> response-ratio en doorlooptijd per uitwisselprofiel en zorgaanbieder.
> Zie [ARCHITECTUUR.md](ARCHITECTUUR.md) voor de positionering binnen KIK-V.

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
rhadix-uitvraag/
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

## Deployment (DTAP)

De app gebruikt een DTAP-flow met branches `develop → staging → main`, GitHub
Actions voor tests en deploy, en gescheiden staging/productie-omgevingen
(eigen poorten zodat KIK naast de Rhadix-validation-app draait). Zie
[DEPLOYMENT.md](DEPLOYMENT.md) voor het volledige proces en de vereiste secrets.
