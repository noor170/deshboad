import logging
import os
from datetime import date, timedelta

import httpx
from fastapi import BackgroundTasks
from sqlalchemy import func, select
from sqlalchemy.orm import Session

try:
    from ..database import Inventory, Order
except ImportError:
    from database import Inventory, Order

logger = logging.getLogger(__name__)

SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")
LOW_STOCK_RUNWAY_DAYS = 10
ALERT_LOOKBACK_DAYS = 30
_last_alert_sent_by_product = {}


async def send_slack_low_stock_alert(
    product_name: str,
    category: str,
    velocity: float,
    days_left: int,
):
    webhook_url = os.getenv("SLACK_WEBHOOK_URL") or SLACK_WEBHOOK_URL
    if not webhook_url:
        logger.warning("SLACK_WEBHOOK_URL is not configured. Skipping low-stock Slack alert.")
        return

    payload = {
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "🚨 DME Operational Alert: Low Stock Velocity Risk",
                    "emoji": True,
                },
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": (
                        f"The product *{product_name}* ({category}) has dropped to "
                        f"*{days_left} Days Left* of stock."
                    ),
                },
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": f"*Sales Velocity*\n{velocity:.2f} units/day",
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"*Runway Remaining*\n{days_left} days",
                    },
                ],
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": (
                            "*Action Recommended:* Consider turning down active ad spend campaigns "
                            "or cutting a rapid replenishment factory purchase order."
                        ),
                    }
                ],
            },
        ]
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(webhook_url, json=payload)
            response.raise_for_status()
    except httpx.HTTPError:
        logger.exception(
            "Failed to deliver Slack low-stock alert for product '%s'.",
            product_name,
        )


def queue_low_stock_alerts(background_tasks: BackgroundTasks, db: Session):
    webhook_url = os.getenv("SLACK_WEBHOOK_URL") or SLACK_WEBHOOK_URL
    if not webhook_url:
        logger.warning("SLACK_WEBHOOK_URL is not configured. Skipping low-stock Slack alert entrypoint.")
        return {
            "enabled": False,
            "queued": 0,
            "skipped": 0,
            "candidates": [],
        }

    candidates = get_low_stock_alert_candidates(db)
    queued = 0
    skipped = 0
    today = date.today()

    for product in candidates:
        last_alert_date = _last_alert_sent_by_product.get(product["product_id"])
        if last_alert_date == today:
            skipped += 1
            continue

        background_tasks.add_task(
            send_slack_low_stock_alert,
            product["product_name"],
            product["category"],
            product["sales_velocity_30d"],
            product["days_left"],
        )
        _last_alert_sent_by_product[product["product_id"]] = today
        queued += 1

    return {
        "enabled": True,
        "queued": queued,
        "skipped": skipped,
        "candidates": candidates,
    }


def get_low_stock_alert_candidates(db: Session):
    inventory_rows = db.execute(select(Inventory)).scalars().all()
    if not inventory_rows:
        return []

    cutoff_date = date.today() - timedelta(days=ALERT_LOOKBACK_DAYS - 1)
    velocity_rows = db.execute(
        select(
            Order.product_id,
            func.sum(Order.quantity).label("quantity_30d"),
        )
        .where(Order.order_date >= cutoff_date)
        .where(Order.is_returned.is_(False))
        .group_by(Order.product_id)
    ).all()

    velocity_map = {}
    for product_id, quantity_30d in velocity_rows:
        velocity_map[product_id] = float(quantity_30d or 0.0) / ALERT_LOOKBACK_DAYS

    candidates = []
    for product in inventory_rows:
        velocity = velocity_map.get(product.product_id, 0.0)
        if velocity <= 0:
            continue

        days_left = product.stock_level / velocity
        if days_left >= LOW_STOCK_RUNWAY_DAYS:
            continue

        candidates.append(
            {
                "product_id": product.product_id,
                "product_name": product.product_name,
                "category": product.category,
                "sales_velocity_30d": round(velocity, 2),
                "days_left": int(days_left),
            }
        )

    candidates.sort(key=lambda item: item["days_left"])
    return candidates
