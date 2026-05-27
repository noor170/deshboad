import os
import sys
import io
from datetime import date

import pandas as pd
from fastapi import (
    BackgroundTasks,
    Depends,
    File,
    FastAPI,
    Header,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.dirname(__file__))

try:
    from .analytics import (
        build_inventory_forecast,
        compute_dashboard_metrics,
        dynamic_safety_stock_adjustment,
        export_operations_report,
        predict_incoming_return_load,
        predict_upcoming_sales,
    )
    from .database import Inventory, get_db, init_db
    from .services.alerts import queue_low_stock_alerts
except ImportError:
    from analytics import (
        build_inventory_forecast,
        compute_dashboard_metrics,
        dynamic_safety_stock_adjustment,
        export_operations_report,
        predict_incoming_return_load,
        predict_upcoming_sales,
    )
    from database import Inventory, get_db, init_db
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
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=25, ge=1, le=250),
    cursor: str | None = Query(default=None),
    offset: int | None = Query(default=None, ge=0),
    db: Session = Depends(get_db),
):
    try:
        if cursor is not None:
            try:
                resolved_offset = max(int(cursor), 0)
            except ValueError as exc:
                raise HTTPException(
                    status_code=400, detail="Invalid cursor value."
                ) from exc
        elif offset is not None:
            resolved_offset = offset
        else:
            resolved_offset = (page - 1) * limit

        resolved_page = (resolved_offset // limit) + 1

        metrics = compute_dashboard_metrics(
            db,
            start_date=start_date,
            end_date=end_date,
            page=resolved_page,
            limit=limit,
            offset=resolved_offset,
        )
        return {"success": True, "data": metrics}
    except HTTPException:
        raise
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


@app.post("/api/v1/operations/import-inventory", status_code=status.HTTP_201_CREATED)
async def import_inventory_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a valid .csv file.",
        )

    required_columns = {
        "product_name",
        "category",
        "stock_level",
        "cost_price",
        "shipping_cost_buffer",
    }

    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Uploaded CSV file is empty.",
            )

        df = pd.read_csv(io.BytesIO(contents))
        normalized_columns = {column: str(column).strip() for column in df.columns}
        df = df.rename(columns=normalized_columns)

        missing_columns = required_columns - set(df.columns)
        if missing_columns:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    "Missing required CSV columns: "
                    + ", ".join(sorted(missing_columns))
                ),
            )

        for column in required_columns:
            if df[column].isna().any():
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Column '{column}' contains empty values.",
                )

        if "product_id" in df.columns:
            if df["product_id"].isna().any():
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Column 'product_id' contains empty values.",
                )
            if df["product_id"].duplicated().any():
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Column 'product_id' contains duplicate values.",
                )
            df["product_id"] = pd.to_numeric(df["product_id"], errors="raise").astype(int)
            next_product_ids = df["product_id"].tolist()
        else:
            current_max_product_id = db.query(func.max(Inventory.product_id)).scalar() or 0
            next_product_ids = list(
                range(current_max_product_id + 1, current_max_product_id + 1 + len(df))
            )

        df["stock_level"] = pd.to_numeric(df["stock_level"], errors="raise").astype(int)
        df["cost_price"] = pd.to_numeric(df["cost_price"], errors="raise").astype(float)
        df["shipping_cost_buffer"] = pd.to_numeric(
            df["shipping_cost_buffer"], errors="raise"
        ).astype(float)

        duplicate_ids_in_db = set()
        if next_product_ids:
            duplicate_ids_in_db = {
                row[0]
                for row in db.query(Inventory.product_id)
                .filter(Inventory.product_id.in_(next_product_ids))
                .all()
            }
        if duplicate_ids_in_db:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "product_id values already exist: "
                    + ", ".join(map(str, sorted(duplicate_ids_in_db)))
                ),
            )

        new_records = []
        for idx, (_, row) in enumerate(df.iterrows()):
            new_records.append(
                Inventory(
                    product_id=int(next_product_ids[idx]),
                    product_name=str(row["product_name"]).strip(),
                    category=str(row["category"]).strip(),
                    stock_level=int(row["stock_level"]),
                    cost_price=float(row["cost_price"]),
                    shipping_cost_buffer=float(row["shipping_cost_buffer"]),
                )
            )

        if new_records:
            db.bulk_save_objects(new_records)
            db.commit()

        return {
            "status": "success",
            "message": f"Successfully imported {len(new_records)} items into inventory.",
            "file_processed": file.filename,
        }
    except HTTPException:
        db.rollback()
        raise
    except (ValueError, TypeError, pd.errors.ParserError) as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid CSV content: {exc}",
        ) from exc
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing the batch upload: {exc}",
        ) from exc
    finally:
        await file.close()


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


@app.get("/api/v1/forecast/sales")
def get_sales_forecast(
    forecast_days: int = Query(default=7, ge=1, le=30),
    db: Session = Depends(get_db),
):
    try:
        result = predict_upcoming_sales(db, forecast_days=forecast_days)
        return {"success": True, "data": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/v1/forecast/returns")
def get_return_forecast(db: Session = Depends(get_db)):
    try:
        result = predict_incoming_return_load(db)
        return {"success": True, "data": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/v1/forecast/safety-stock")
def get_safety_stock(db: Session = Depends(get_db)):
    try:
        result = dynamic_safety_stock_adjustment(db)
        return {"success": True, "data": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("BACKEND_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
