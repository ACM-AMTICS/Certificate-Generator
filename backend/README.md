# ACM Event Certificate Generator - Backend API

FastAPI backend powered by MongoDB for issuing participant certificates during ACM events.

## Features
- **Lightweight & Fast**: Built with FastAPI & Motor async driver.
- **Duplicate Claim Protection**: MongoDB compound unique index `(event_id, device_token)` ensures one certificate per device token per event.
- **Sequential Certificate Numbering**: Issues safe, format-consistent numbers (`ACM-2026-001`).
- **Auto Database Initialization**: Automatically seeds default event `gsoc-2026` on startup.

## Local Setup & Run

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the application:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

3. API Documentation available at:
   - Interactive Swagger UI: `http://localhost:8000/docs`

## 🐳 Docker & Docker Compose Deployment

### Run with Docker Compose (Recommended)
```bash
# Start backend in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop containers
docker compose down
```

### Manual Docker Command
```bash
docker build -t acm-certificate-backend .
docker run -d -p 8000:8000 --env-file .env --name acm-certificate-backend acm-certificate-backend
```
