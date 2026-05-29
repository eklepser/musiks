CREATE OR REPLACE FUNCTION trg_update_product_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INT;
    product_name TEXT;
BEGIN
    SELECT stock, name INTO current_stock, product_name 
    FROM "Product" 
    WHERE product_id = NEW.product_id;

    IF product_name IS NULL THEN
        RAISE EXCEPTION 'Товар с ID % не найден в базе', NEW.product_id;
    END IF;

    IF current_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Недостаточно товара % на складе. Доступно: %, заказано: %', product_name, current_stock, NEW.quantity;
    END IF;

    UPDATE "Product"
    SET stock = stock - NEW.quantity
    WHERE product_id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg-OrderItem-insert-before ON "OrderItem";

CREATE TRIGGER trg-OrderItem-insert-before
    BEFORE INSERT ON "OrderItem"
    FOR EACH ROW
    EXECUTE FUNCTION trg_update_product_stock_on_order();