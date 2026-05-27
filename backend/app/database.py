import os
import random
from datetime import date, datetime, timedelta
from urllib.parse import quote_plus

from sqlalchemy import Boolean, Column, Date, Float, Integer, String, create_engine, inspect
from sqlalchemy.orm import declarative_base, sessionmaker

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME", "defaultdb")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_DIALECT = os.getenv("DB_DIALECT", "sqlite").lower()
SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", "./ecommerce.db")
DB_CONNECT_TIMEOUT = int(os.getenv("DB_CONNECT_TIMEOUT", "10"))
DB_READ_TIMEOUT = int(os.getenv("DB_READ_TIMEOUT", "10"))
DB_WRITE_TIMEOUT = int(os.getenv("DB_WRITE_TIMEOUT", "10"))
DB_SSL_MODE = os.getenv("DB_SSL_MODE", "").lower()
DB_SSL_CA = os.getenv("DB_SSL_CA")

if DB_DIALECT == "mysql" or all([DB_USER, DB_PASSWORD, DB_HOST, DB_NAME]):
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://"
        f"{quote_plus(DB_USER or '')}:{quote_plus(DB_PASSWORD or '')}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}",
    )
else:
    DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{SQLITE_DB_PATH}")


def _build_connect_args():
    if DATABASE_URL.startswith("sqlite"):
        return {"check_same_thread": False}

    connect_args = {
        "charset": "utf8mb4",
        "connect_timeout": DB_CONNECT_TIMEOUT,
        "read_timeout": DB_READ_TIMEOUT,
        "write_timeout": DB_WRITE_TIMEOUT,
    }

    if DB_SSL_MODE in {"1", "true", "enabled", "require", "required"} or DB_SSL_CA:
        ssl_config = {}
        if DB_SSL_CA:
            ssl_config["ca"] = DB_SSL_CA
        connect_args["ssl"] = ssl_config

    return connect_args


engine = create_engine(
    DATABASE_URL,
    connect_args=_build_connect_args(),
    pool_pre_ping=not DATABASE_URL.startswith("sqlite"),
    pool_recycle=3600 if not DATABASE_URL.startswith("sqlite") else -1,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, nullable=False, index=True)
    sale_amount = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    order_date = Column(Date, nullable=False, index=True)
    is_returned = Column(Boolean, nullable=False, default=False)


class Inventory(Base):
    __tablename__ = "inventory"

    product_id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(120), nullable=False)
    category = Column(String(80), nullable=False, index=True)
    stock_level = Column(Integer, nullable=False)
    cost_price = Column(Float, nullable=False)
    shipping_cost_buffer = Column(Float, nullable=False)


class MarketingSpend(Base):
    __tablename__ = "marketing_spend"

    id = Column(Integer, primary_key=True, index=True)
    spend_date = Column(Date, nullable=False, index=True)
    ad_spend_amount = Column(Float, nullable=False)


EXPECTED_COLUMNS = {
    "orders": {"id", "product_id", "sale_amount", "quantity", "order_date", "is_returned"},
    "inventory": {
        "product_id",
        "product_name",
        "category",
        "stock_level",
        "cost_price",
        "shipping_cost_buffer",
    },
    "marketing_spend": {"id", "spend_date", "ad_spend_amount"},
}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    _ensure_schema()
    Base.metadata.create_all(bind=engine)
    seed_demo_data()


def _ensure_schema():
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    schema_matches = True

    for table_name, columns in EXPECTED_COLUMNS.items():
        if table_name not in existing_tables:
            schema_matches = False
            break
        existing_columns = {column["name"] for column in inspector.get_columns(table_name)}
        if existing_columns != columns:
            schema_matches = False
            break

    if schema_matches:
        return

    if not DATABASE_URL.startswith("sqlite"):
        return

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def seed_demo_data():
    db = SessionLocal()
    try:
        if db.query(Order).count() > 0:
            return

        random.seed(42)
        today = date.today()
        start_date = today - timedelta(days=180)

        products = [
            (101, "AeroNoise Headphones", "Electronics", 48, 72.0, 6.5),
            (102, "PulseFit Smartwatch", "Electronics", 28, 118.0, 7.2),
            (103, "LumaBeam Desk Lamp", "Home Goods", 96, 24.0, 4.2),
            (104, "CloudWeave Throw", "Home Goods", 54, 18.0, 5.1),
            (105, "Northline Running Jacket", "Apparel", 44, 31.0, 5.8),
            (106, "Everyday Essential Tee", "Apparel", 140, 8.5, 2.7),
            (107, "TerraBrew Kettle", "Home Goods", 37, 29.0, 4.8),
            (108, "Summit Trail Pack", "Apparel", 22, 42.0, 6.0),
            (109, "ArcCharge Power Bank", "Electronics", 62, 21.0, 3.9),
            (110, "StudioGrip Phone Stand", "Electronics", 116, 7.5, 2.3),
            (111, "Haven Ceramic Set", "Home Goods", 18, 36.0, 6.7),
            (112, "Coastline Linen Shirt", "Apparel", 26, 27.0, 5.2),
        ]

        inventory_rows = [
            Inventory(
                product_id=product_id,
                product_name=product_name,
                category=category,
                stock_level=stock_level,
                cost_price=cost_price,
                shipping_cost_buffer=shipping_cost_buffer,
            )
            for product_id, product_name, category, stock_level, cost_price, shipping_cost_buffer in products
        ]
        db.bulk_save_objects(inventory_rows)

        marketing_rows = []
        for offset in range(181):
            current_date = start_date + timedelta(days=offset)
            weekday_multiplier = 1.18 if current_date.weekday() in (4, 5) else 1.0
            seasonality = 1 + (offset / 180) * 0.12
            base_spend = random.uniform(220.0, 540.0)
            marketing_rows.append(
                MarketingSpend(
                    spend_date=current_date,
                    ad_spend_amount=round(base_spend * weekday_multiplier * seasonality, 2),
                )
            )
        db.bulk_save_objects(marketing_rows)

        price_map = {
            101: 149.0,
            102: 239.0,
            103: 52.0,
            104: 44.0,
            105: 88.0,
            106: 28.0,
            107: 74.0,
            108: 109.0,
            109: 47.0,
            110: 19.0,
            111: 96.0,
            112: 72.0,
        }
        demand_map = {
            101: 2.4,
            102: 1.6,
            103: 1.8,
            104: 1.2,
            105: 1.4,
            106: 3.8,
            107: 1.0,
            108: 0.9,
            109: 2.7,
            110: 4.5,
            111: 0.7,
            112: 1.1,
        }
        return_rate_map = {
            "Electronics": 0.06,
            "Apparel": 0.18,
            "Home Goods": 0.11,
        }

        orders = []
        order_id = 1
        for offset in range(181):
            current_date = start_date + timedelta(days=offset)
            monthly_factor = 1.0 + 0.18 * ((current_date.month % 3) / 2)
            weekend_factor = 1.25 if current_date.weekday() in (5, 6) else 1.0

            for product_id, _, category, _, cost_price, _ in products:
                expected_orders = demand_map[product_id] * monthly_factor * weekend_factor
                order_count = max(0, int(random.gauss(expected_orders, 0.9)))
                for _ in range(order_count):
                    quantity = max(1, int(random.gauss(1.8 if category == "Apparel" else 1.4, 0.7)))
                    gross_multiplier = random.uniform(1.52, 2.35)
                    sale_amount = quantity * round(cost_price * gross_multiplier, 2)
                    returned = random.random() < return_rate_map[category]

                    orders.append(
                        Order(
                            id=order_id,
                            product_id=product_id,
                            sale_amount=round(sale_amount, 2),
                            quantity=quantity,
                            order_date=current_date,
                            is_returned=returned,
                        )
                    )
                    order_id += 1

        db.bulk_save_objects(orders)
        db.commit()
    finally:
        db.close()
