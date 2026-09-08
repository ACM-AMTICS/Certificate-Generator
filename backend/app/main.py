from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from app.database import init_db
from app.routes import router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("Starting ACM Certificate Generator Backend...")
    await init_db()
    yield
    logging.info("Shutting down backend...")

app = FastAPI(
    title="ACM Certificate Generator API",
    description="Backend API for issuing participant certificates during ACM events",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "ACM Event Certificate Generator API",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
