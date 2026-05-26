import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database import get_db, init_db
from analytics import compute_dashboard_metrics, generate_sales_distribution_chart

app = FastAPI(
    title="E-commerce Operations API",
    description="Business analytics and operations dashboard backend",
    version="1.0.0",
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
    return {"status": "ok", "message": "E-commerce Analytics API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/api/v1/operations/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    try:
        metrics = compute_dashboard_metrics(db)
        return {
            "success": True,
            "data": metrics,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/v1/operations/chart")
def get_chart(db: Session = Depends(get_db)):
    try:
        path = generate_sales_distribution_chart(db)
        return FileResponse(path, media_type="image/png", filename="sales_distribution.png")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/v1/operations/orders")
def get_orders(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    from database import Order
    try:
        orders = db.query(Order).offset(skip).limit(limit).all()
        return {
            "success": True,
            "data": [
                {
                    "id": o.id,
                    "order_date": o.order_date.isoformat() if o.order_date else None,
                    "revenue": o.revenue,
                    "product_category": o.product_category,
                    "customer_region": o.customer_region,
                    "units_sold": o.units_sold,
                    "month_label": o.month_label,
                }
                for o in orders
            ],
            "total": db.query(Order).count(),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("BACKEND_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
