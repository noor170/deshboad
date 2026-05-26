import os
from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")

if all([DB_USER, DB_PASSWORD, DB_HOST, DB_NAME]):
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
else:
    DATABASE_URL = "sqlite:///./ecommerce.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_date = Column(DateTime, default=datetime.utcnow)
    revenue = Column(Float, nullable=False)
    product_category = Column(String(100), nullable=True)
    customer_region = Column(String(100), nullable=True)
    units_sold = Column(Integer, nullable=True)
    month_label = Column(String(20), nullable=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
    seed_demo_data()


def seed_demo_data():
    db = SessionLocal()
    try:
        if db.query(Order).count() > 0:
            return

        import random
        from datetime import timedelta

        random.seed(42)
        categories = ["Electronics", "Apparel", "Home & Garden", "Sports", "Books"]
        regions = ["North", "South", "East", "West", "Central"]
        months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ]

        base_date = datetime(2025, 1, 1)
        orders = []
        for i in range(240):
            month_idx = i % 12
            revenue = random.gauss(1800, 400)
            if random.random() < 0.05:
                revenue += random.choice([-1, 1]) * random.uniform(2000, 4000)
            revenue = max(50, revenue)

            orders.append(Order(
                order_date=base_date + timedelta(days=i * 3),
                revenue=round(revenue, 2),
                product_category=random.choice(categories),
                customer_region=random.choice(regions),
                units_sold=random.randint(1, 50),
                month_label=months[month_idx],
            ))

        db.bulk_save_objects(orders)
        db.commit()
    finally:
        db.close()
