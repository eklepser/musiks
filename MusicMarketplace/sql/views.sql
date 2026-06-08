CREATE VIEW view_clothing_full AS
SELECT 
    c.clothing_id,
    c.merch_id,
    c.size,
    c.gender,
    m.material,
    m.color,
    p.product_id,
    p.name,
    p.price,
    p.description,
    p.stock,
    p.manufacturer_id,
    mf.name AS manufacturer_name
FROM "Clothing" c
JOIN "Merch" m ON c.merch_id = m.merch_id
JOIN "Product" p ON m.product_id = p.product_id
JOIN "Manufacturer" mf ON p.manufacturer_id = mf.manufacturer_id;

CREATE VIEW view_accessory_full AS
SELECT 
    a.accessory_id,
    a.merch_id,
    a.accessory_type,
    a.weight,
    m.material,
    m.color,
    p.product_id,
    p.name,
    p.price,
    p.description,
    p.stock,
    p.manufacturer_id,
    mf.name AS manufacturer_name
FROM "Accessory" a
JOIN "Merch" m ON a.merch_id = m.merch_id
JOIN "Product" p ON m.product_id = p.product_id
JOIN "Manufacturer" mf ON p.manufacturer_id = mf.manufacturer_id;

CREATE VIEW view_ticket_full AS
SELECT 
    t.ticket_id,
    t.concert_id,
    t.price_category,
    c.title AS concert_title,
    c.venue,
    c.datetime,
    p.product_id,
    p.name,
    p.price,
    p.description,
    p.stock,
    p.manufacturer_id,
    mf.name AS manufacturer_name
FROM "Ticket" t
JOIN "Product" p ON t.product_id = p.product_id
JOIN "Concert" c ON t.concert_id = c.concert_id
JOIN "Manufacturer" mf ON p.manufacturer_id = mf.manufacturer_id;