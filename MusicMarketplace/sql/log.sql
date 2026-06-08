CREATE OR REPLACE FUNCTION write_log(
    p_table_name TEXT,
    p_record_id INT,
    p_operation TEXT,
    p_old_data JSONB,
    p_new_data JSONB
) RETURNS VOID AS $$
BEGIN
    INSERT INTO "ChangeLog" (table_name, record_id, operation_type, old_data, new_data, changed_at)
    VALUES (p_table_name, p_record_id, p_operation, p_old_data, p_new_data, CURRENT_TIMESTAMP);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_user_insert()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('User', NEW.user_id, 'INSERT', NULL, to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_user_update()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('User', NEW.user_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('User', OLD.user_id, 'DELETE', to_jsonb(OLD), NULL);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_User_insert_after ON "User";
CREATE TRIGGER trg_User_insert_after AFTER INSERT ON "User" FOR EACH ROW EXECUTE FUNCTION log_user_insert();
DROP TRIGGER IF EXISTS trg_User_update_after ON "User";
CREATE TRIGGER trg_User_update_after AFTER UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION log_user_update();
DROP TRIGGER IF EXISTS trg_User_delete_after ON "User";
CREATE TRIGGER trg_User_delete_after AFTER DELETE ON "User" FOR EACH ROW EXECUTE FUNCTION log_user_delete();

CREATE OR REPLACE FUNCTION log_product_insert()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Product', NEW.product_id, 'INSERT', NULL, to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_product_update()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Product', NEW.product_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_product_delete()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Product', OLD.product_id, 'DELETE', to_jsonb(OLD), NULL);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_Product_insert_after ON "Product";
CREATE TRIGGER trg_Product_insert_after AFTER INSERT ON "Product" FOR EACH ROW EXECUTE FUNCTION log_product_insert();
DROP TRIGGER IF EXISTS trg_Product_update_after ON "Product";
CREATE TRIGGER trg_Product_update_after AFTER UPDATE ON "Product" FOR EACH ROW EXECUTE FUNCTION log_product_update();
DROP TRIGGER IF EXISTS trg_Product_delete_after ON "Product";
CREATE TRIGGER trg_Product_delete_after AFTER DELETE ON "Product" FOR EACH ROW EXECUTE FUNCTION log_product_delete();

CREATE OR REPLACE FUNCTION log_merch_insert()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Merch', NEW.merch_id, 'INSERT', NULL, to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_merch_update()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Merch', NEW.merch_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_merch_delete()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Merch', OLD.merch_id, 'DELETE', to_jsonb(OLD), NULL);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_Merch_insert_after ON "Merch";
CREATE TRIGGER trg_Merch_insert_after AFTER INSERT ON "Merch" FOR EACH ROW EXECUTE FUNCTION log_merch_insert();
DROP TRIGGER IF EXISTS trg_Merch_update_after ON "Merch";
CREATE TRIGGER trg_Merch_update_after AFTER UPDATE ON "Merch" FOR EACH ROW EXECUTE FUNCTION log_merch_update();
DROP TRIGGER IF EXISTS trg_Merch_delete_after ON "Merch";
CREATE TRIGGER trg_Merch_delete_after AFTER DELETE ON "Merch" FOR EACH ROW EXECUTE FUNCTION log_merch_delete();

CREATE OR REPLACE FUNCTION log_ticket_insert()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Ticket', NEW.ticket_id, 'INSERT', NULL, to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_ticket_update()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Ticket', NEW.ticket_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_ticket_delete()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Ticket', OLD.ticket_id, 'DELETE', to_jsonb(OLD), NULL);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_Ticket_insert_after ON "Ticket";
CREATE TRIGGER trg_Ticket_insert_after AFTER INSERT ON "Ticket" FOR EACH ROW EXECUTE FUNCTION log_ticket_insert();
DROP TRIGGER IF EXISTS trg_Ticket_update_after ON "Ticket";
CREATE TRIGGER trg_Ticket_update_after AFTER UPDATE ON "Ticket" FOR EACH ROW EXECUTE FUNCTION log_ticket_update();
DROP TRIGGER IF EXISTS trg_Ticket_delete_after ON "Ticket";
CREATE TRIGGER trg_Ticket_delete_after AFTER DELETE ON "Ticket" FOR EACH ROW EXECUTE FUNCTION log_ticket_delete();

CREATE OR REPLACE FUNCTION log_clothing_insert()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Clothing', NEW.clothing_id, 'INSERT', NULL, to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_clothing_update()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Clothing', NEW.clothing_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_clothing_delete()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Clothing', OLD.clothing_id, 'DELETE', to_jsonb(OLD), NULL);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_Clothing_insert_after ON "Clothing";
CREATE TRIGGER trg_Clothing_insert_after AFTER INSERT ON "Clothing" FOR EACH ROW EXECUTE FUNCTION log_clothing_insert();
DROP TRIGGER IF EXISTS trg_Clothing_update_after ON "Clothing";
CREATE TRIGGER trg_Clothing_update_after AFTER UPDATE ON "Clothing" FOR EACH ROW EXECUTE FUNCTION log_clothing_update();
DROP TRIGGER IF EXISTS trg_Clothing_delete_after ON "Clothing";
CREATE TRIGGER trg_Clothing_delete_after AFTER DELETE ON "Clothing" FOR EACH ROW EXECUTE FUNCTION log_clothing_delete();

CREATE OR REPLACE FUNCTION log_accessory_insert()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Accessory', NEW.accessory_id, 'INSERT', NULL, to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_accessory_update()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Accessory', NEW.accessory_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_accessory_delete()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Accessory', OLD.accessory_id, 'DELETE', to_jsonb(OLD), NULL);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_Accessory_insert_after ON "Accessory";
CREATE TRIGGER trg_Accessory_insert_after AFTER INSERT ON "Accessory" FOR EACH ROW EXECUTE FUNCTION log_accessory_insert();
DROP TRIGGER IF EXISTS trg_Accessory_update_after ON "Accessory";
CREATE TRIGGER trg_Accessory_update_after AFTER UPDATE ON "Accessory" FOR EACH ROW EXECUTE FUNCTION log_accessory_update();
DROP TRIGGER IF EXISTS trg_Accessory_delete_after ON "Accessory";
CREATE TRIGGER trg_Accessory_delete_after AFTER DELETE ON "Accessory" FOR EACH ROW EXECUTE FUNCTION log_accessory_delete();

CREATE OR REPLACE FUNCTION log_concert_insert()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Concert', NEW.concert_id, 'INSERT', NULL, to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_concert_update()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Concert', NEW.concert_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_concert_delete()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Concert', OLD.concert_id, 'DELETE', to_jsonb(OLD), NULL);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_Concert_insert_after ON "Concert";
CREATE TRIGGER trg_Concert_insert_after AFTER INSERT ON "Concert" FOR EACH ROW EXECUTE FUNCTION log_concert_insert();
DROP TRIGGER IF EXISTS trg_Concert_update_after ON "Concert";
CREATE TRIGGER trg_Concert_update_after AFTER UPDATE ON "Concert" FOR EACH ROW EXECUTE FUNCTION log_concert_update();
DROP TRIGGER IF EXISTS trg_Concert_delete_after ON "Concert";
CREATE TRIGGER trg_Concert_delete_after AFTER DELETE ON "Concert" FOR EACH ROW EXECUTE FUNCTION log_concert_delete();

CREATE OR REPLACE FUNCTION log_genre_insert()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Genre', NEW.genre_id, 'INSERT', NULL, to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_genre_update()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Genre', NEW.genre_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_genre_delete()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Genre', OLD.genre_id, 'DELETE', to_jsonb(OLD), NULL);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_Genre_insert_after ON "Genre";
CREATE TRIGGER trg_Genre_insert_after AFTER INSERT ON "Genre" FOR EACH ROW EXECUTE FUNCTION log_genre_insert();
DROP TRIGGER IF EXISTS trg_Genre_update_after ON "Genre";
CREATE TRIGGER trg_Genre_update_after AFTER UPDATE ON "Genre" FOR EACH ROW EXECUTE FUNCTION log_genre_update();
DROP TRIGGER IF EXISTS trg_Genre_delete_after ON "Genre";
CREATE TRIGGER trg_Genre_delete_after AFTER DELETE ON "Genre" FOR EACH ROW EXECUTE FUNCTION log_genre_delete();

CREATE OR REPLACE FUNCTION log_artist_insert()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Artist', NEW.artist_id, 'INSERT', NULL, to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_artist_update()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Artist', NEW.artist_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_artist_delete()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Artist', OLD.artist_id, 'DELETE', to_jsonb(OLD), NULL);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_Artist_insert_after ON "Artist";
CREATE TRIGGER trg_Artist_insert_after AFTER INSERT ON "Artist" FOR EACH ROW EXECUTE FUNCTION log_artist_insert();
DROP TRIGGER IF EXISTS trg_Artist_update_after ON "Artist";
CREATE TRIGGER trg_Artist_update_after AFTER UPDATE ON "Artist" FOR EACH ROW EXECUTE FUNCTION log_artist_update();
DROP TRIGGER IF EXISTS trg_Artist_delete_after ON "Artist";
CREATE TRIGGER trg_Artist_delete_after AFTER DELETE ON "Artist" FOR EACH ROW EXECUTE FUNCTION log_artist_delete();

CREATE OR REPLACE FUNCTION log_manufacturer_insert()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Manufacturer', NEW.manufacturer_id, 'INSERT', NULL, to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_manufacturer_update()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Manufacturer', NEW.manufacturer_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_manufacturer_delete()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Manufacturer', OLD.manufacturer_id, 'DELETE', to_jsonb(OLD), NULL);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_Manufacturer_insert_after ON "Manufacturer";
CREATE TRIGGER trg_Manufacturer_insert_after AFTER INSERT ON "Manufacturer" FOR EACH ROW EXECUTE FUNCTION log_manufacturer_insert();
DROP TRIGGER IF EXISTS trg_Manufacturer_update_after ON "Manufacturer";
CREATE TRIGGER trg_Manufacturer_update_after AFTER UPDATE ON "Manufacturer" FOR EACH ROW EXECUTE FUNCTION log_manufacturer_update();
DROP TRIGGER IF EXISTS trg_Manufacturer_delete_after ON "Manufacturer";
CREATE TRIGGER trg_Manufacturer_delete_after AFTER DELETE ON "Manufacturer" FOR EACH ROW EXECUTE FUNCTION log_manufacturer_delete();

CREATE OR REPLACE FUNCTION log_order_insert()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Order', NEW.order_id, 'INSERT', NULL, to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_order_update()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Order', NEW.order_id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_order_delete()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM write_log('Order', OLD.order_id, 'DELETE', to_jsonb(OLD), NULL);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_Order_insert_after ON "Order";
CREATE TRIGGER trg_Order_insert_after AFTER INSERT ON "Order" FOR EACH ROW EXECUTE FUNCTION log_order_insert();
DROP TRIGGER IF EXISTS trg_Order_update_after ON "Order";
CREATE TRIGGER trg_Order_update_after AFTER UPDATE ON "Order" FOR EACH ROW EXECUTE FUNCTION log_order_update();
DROP TRIGGER IF EXISTS trg_Order_delete_after ON "Order";
CREATE TRIGGER trg_Order_delete_after AFTER DELETE ON "Order" FOR EACH ROW EXECUTE FUNCTION log_order_delete();