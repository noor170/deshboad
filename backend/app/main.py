import os
import sys
from datetime import date

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.dirname(__file__))

try:
    from .analytics import compute_dashboard_metrics, export_operations_report
    from .database import get_db, init_db
except ImportError:
    from analytics import compute_dashboard_metrics, export_operations_report
    from database import get_db, init_db

app = FastAPI(
    title="Retail Operations Dashboard API",
    description="Operational analytics for inventory, marketing efficiency, and retail profitability",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def root():
    return {"status": "ok", "message": "Retail operations analytics API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/api/v1/operations/dashboard")
def get_dashboard(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
):
    try:
        metrics = compute_dashboard_metrics(db, start_date=start_date, end_date=end_date)
        return {"success": True, "data": metrics}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/v1/operations/export")
def export_dashboard(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    file_format: str = Query(default="csv", pattern="^(csv|xlsx)$"),
    db: Session = Depends(get_db),
):
    try:
        file_path, filename, media_type = export_operations_report(
            db,
            start_date=start_date,
            end_date=end_date,
            file_format=file_format,
        )
        return FileResponse(file_path, media_type=media_type, filename=filename)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("BACKEND_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
