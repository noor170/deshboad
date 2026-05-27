import os
import sys
from datetime import date

from fastapi import BackgroundTasks, Depends, FastAPI, Header, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.dirname(__file__))

try:
    from .analytics import build_inventory_forecast, compute_dashboard_metrics, export_operations_report
    from .database import get_db, init_db
    from .services.alerts import queue_low_stock_alerts
except ImportError:
    from analytics import build_inventory_forecast, compute_dashboard_metrics, export_operations_report
    from database import get_db, init_db
    from services.alerts import queue_low_stock_alerts

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

SLACK_ALERT_TOKEN = os.getenv("SLACK_ALERT_TOKEN")


def require_slack_alert_token(x_alert_token: str | None = Header(default=None)):
    if not SLACK_ALERT_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Slack alert endpoint is not configured.",
        )

    if x_alert_token != SLACK_ALERT_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid alert token.",
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
    limit: int = Query(default=25, ge=1, le=250),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    try:
        metrics = compute_dashboard_metrics(
            db,
            start_date=start_date,
            end_date=end_date,
            limit=limit,
            offset=offset,
        )
        return {"success": True, "data": metrics}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/v1/alerts/slack/low-stock")
def trigger_low_stock_slack_alerts(
    background_tasks: BackgroundTasks,
    _authorized: None = Depends(require_slack_alert_token),
    db: Session = Depends(get_db),
):
    try:
        result = queue_low_stock_alerts(background_tasks, db)
        return {"success": True, "data": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/v1/forecast/inventory")
def get_inventory_forecast(
    product_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    try:
        forecast = build_inventory_forecast(db, product_id=product_id)
        return {"success": True, "data": forecast}
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
