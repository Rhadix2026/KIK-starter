"""
KIK-Starter (Rhadix-editie) — FastAPI backend
=============================================
Mijlpaal 2: gebruikersbeheer met multi-tenant hiërarchie
  PLATFORM_ADMIN → ORG_ADMIN → ORG_USER  (zoals Rhadix-validatie).
"""
from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.bootstrap import init_db
from app.routers import health, meta, admin, org
from app.auth.router import router as auth_router

APP_VERSION = "0.2.0"

app = FastAPI(title="KIK-Starter API (Rhadix-editie)", version=APP_VERSION)

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)


@app.on_event("startup")
def _startup():
    init_db()


app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(meta.router, prefix="/api", tags=["meta"])
app.include_router(auth_router, prefix="/api/auth")
app.include_router(admin.router, prefix="/api/admin")
app.include_router(org.router, prefix="/api/org")


@app.get("/api")
def root():
    return {"app": "KIK-Starter", "edition": "Rhadix", "version": APP_VERSION}
