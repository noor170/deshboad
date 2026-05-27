CREATE DATABASE IF NOT EXISTS defaultdb;
USE defaultdb;

CREATE USER IF NOT EXISTS 'ecommerce_user'@'%' IDENTIFIED BY 'ecommerce_pass123';
GRANT ALL PRIVILEGES ON defaultdb.* TO 'ecommerce_user'@'%';
FLUSH PRIVILEGES;

CREATE TABLE IF NOT EXISTS orders (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    sale_amount DECIMAL(12,2) NOT NULL,
    quantity INT NOT NULL,
    order_date DATE NOT NULL,
    is_returned TINYINT(1) NOT NULL DEFAULT 0,
    INDEX idx_orders_product_id (product_id),
    INDEX idx_orders_order_date (order_date)
);

CREATE TABLE IF NOT EXISTS inventory (
    product_id INT NOT NULL PRIMARY KEY,
    product_name VARCHAR(120) NOT NULL,
    category VARCHAR(80) NOT NULL,
    stock_level INT NOT NULL,
    cost_price DECIMAL(12,2) NOT NULL,
    shipping_cost_buffer DECIMAL(12,2) NOT NULL,
    INDEX idx_inventory_category (category)
);

CREATE TABLE IF NOT EXISTS marketing_spend (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    spend_date DATE NOT NULL,
    ad_spend_amount DECIMAL(12,2) NOT NULL,
    INDEX idx_marketing_spend_date (spend_date)
);

DROP TEMPORARY TABLE IF EXISTS seed_products;
CREATE TEMPORARY TABLE seed_products (
    product_id INT NOT NULL PRIMARY KEY,
    product_name VARCHAR(120) NOT NULL,
    category VARCHAR(80) NOT NULL,
    stock_level INT NOT NULL,
    cost_price DECIMAL(12,2) NOT NULL,
    shipping_cost_buffer DECIMAL(12,2) NOT NULL,
    list_price DECIMAL(12,2) NOT NULL,
    demand_weight INT NOT NULL,
    return_rate_threshold INT NOT NULL
);

INSERT INTO seed_products (
    product_id,
    product_name,
    category,
    stock_level,
    cost_price,
    shipping_cost_buffer,
    list_price,
    demand_weight,
    return_rate_threshold
) VALUES
    (101, 'AeroNoise Headphones', 'Electronics', 52, 72.00, 6.50, 149.00, 6, 5),
    (102, 'PulseFit Smartwatch', 'Electronics', 24, 118.00, 7.20, 239.00, 7, 6),
    (103, 'LumaBeam Desk Lamp', 'Home Goods', 96, 24.00, 4.20, 52.00, 4, 9),
    (104, 'CloudWeave Throw', 'Home Goods', 58, 18.00, 5.10, 44.00, 3, 10),
    (105, 'Northline Running Jacket', 'Apparel', 39, 31.00, 5.80, 88.00, 4, 18),
    (106, 'Everyday Essential Tee', 'Apparel', 132, 8.50, 2.70, 28.00, 7, 22),
    (107, 'TerraBrew Kettle', 'Home Goods', 42, 29.00, 4.80, 74.00, 3, 11),
    (108, 'Summit Trail Pack', 'Apparel', 18, 42.00, 6.00, 109.00, 5, 17),
    (109, 'ArcCharge Power Bank', 'Electronics', 64, 21.00, 3.90, 47.00, 6, 5),
    (110, 'StudioGrip Phone Stand', 'Electronics', 118, 7.50, 2.30, 19.00, 8, 4),
    (111, 'Haven Ceramic Set', 'Home Goods', 14, 36.00, 6.70, 96.00, 4, 12),
    (112, 'Coastline Linen Shirt', 'Apparel', 21, 27.00, 5.20, 72.00, 4, 19);

INSERT INTO inventory (
    product_id,
    product_name,
    category,
    stock_level,
    cost_price,
    shipping_cost_buffer
)
SELECT
    product_id,
    product_name,
    category,
    stock_level,
    cost_price,
    shipping_cost_buffer
FROM seed_products;

INSERT INTO marketing_spend (
    spend_date,
    ad_spend_amount
)
WITH RECURSIVE day_offsets AS (
    SELECT 0 AS day_offset
    UNION ALL
    SELECT day_offset + 1
    FROM day_offsets
    WHERE day_offset < 179
)
SELECT
    DATE_SUB(CURDATE(), INTERVAL (179 - day_offset) DAY) AS spend_date,
    ROUND(
        235.00
        + (day_offset * 1.95)
        + (MOD(day_offset, 9) * 14.25)
        + CASE
            WHEN WEEKDAY(DATE_SUB(CURDATE(), INTERVAL (179 - day_offset) DAY)) IN (4, 5) THEN 110.00
            WHEN WEEKDAY(DATE_SUB(CURDATE(), INTERVAL (179 - day_offset) DAY)) = 6 THEN 85.00
            ELSE 35.00
          END,
        2
    ) AS ad_spend_amount
FROM day_offsets;

INSERT INTO orders (
    product_id,
    sale_amount,
    quantity,
    order_date,
    is_returned
)
WITH RECURSIVE day_offsets AS (
    SELECT 0 AS day_offset
    UNION ALL
    SELECT day_offset + 1
    FROM day_offsets
    WHERE day_offset < 179
),
slots AS (
    SELECT 1 AS slot_id
    UNION ALL SELECT 2
    UNION ALL SELECT 3
    UNION ALL SELECT 4
    UNION ALL SELECT 5
    UNION ALL SELECT 6
),
calendar_days AS (
    SELECT
        day_offset,
        DATE_SUB(CURDATE(), INTERVAL (179 - day_offset) DAY) AS order_date
    FROM day_offsets
)
SELECT
    sp.product_id,
    ROUND(
        sp.list_price
        * (
            1
            + MOD(sp.product_id + slots.slot_id + calendar_days.day_offset, 3)
        )
        * (
            0.97
            + (
                MOD(
                    sp.product_id * 7 + slots.slot_id * 5 + calendar_days.day_offset,
                    8
                ) * 0.01
            )
        ),
        2
    ) AS sale_amount,
    1 + MOD(sp.product_id + slots.slot_id + calendar_days.day_offset, 3) AS quantity,
    calendar_days.order_date,
    CASE
        WHEN MOD(
            sp.product_id * 11 + slots.slot_id * 13 + calendar_days.day_offset * 3,
            100
        ) < sp.return_rate_threshold THEN 1
        ELSE 0
    END AS is_returned
FROM seed_products sp
JOIN calendar_days
JOIN slots
WHERE MOD(
    sp.product_id * 3 + calendar_days.day_offset * 5 + slots.slot_id * 7,
    10
) < (
    sp.demand_weight
    + CASE
        WHEN WEEKDAY(calendar_days.order_date) IN (5, 6) THEN 1
        ELSE 0
      END
    + CASE
        WHEN MONTH(calendar_days.order_date) IN (11, 12) THEN 1
        ELSE 0
      END
);

DROP TEMPORARY TABLE IF EXISTS seed_products;
