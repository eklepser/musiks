CREATE OR REPLACE FUNCTION create_ticket(
    p_name VARCHAR, p_price DECIMAL, p_description TEXT, p_stock INT, 
    p_manufacturer_id INT, p_concert_id INT, p_price_category VARCHAR, p_genre_ids_json TEXT
)
RETURNS TABLE (
    ticket_id INT, product_id INT, name VARCHAR, price DECIMAL, 
    description TEXT, stock INT, manufacturer_id INT, concert_id INT, price_category VARCHAR
) AS $$
DECLARE v_product_id INT; v_ticket_id INT; v_genre_ids INT[]; genre_id INT;
BEGIN
    INSERT INTO "Product" (name, price, description, stock, manufacturer_id) 
    VALUES (trim(p_name), p_price, trim(p_description), p_stock, p_manufacturer_id) 
    RETURNING "Product".product_id INTO v_product_id;
    
    INSERT INTO "Ticket" (concert_id, product_id, price_category) 
    VALUES (p_concert_id, v_product_id, trim(p_price_category)) 
    RETURNING "Ticket".ticket_id INTO v_ticket_id;
    
    IF p_genre_ids_json IS NOT NULL AND p_genre_ids_json != '' AND p_genre_ids_json != '[]' THEN
        v_genre_ids := ARRAY(SELECT json_array_elements_text(p_genre_ids_json::json)::INT);
        FOREACH genre_id IN ARRAY v_genre_ids LOOP 
            INSERT INTO "ProductGenre" (product_id, genre_id) VALUES (v_product_id, genre_id); 
        END LOOP;
    END IF;
    
    RETURN QUERY SELECT * FROM get_ticket_by_id(v_ticket_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_ticket(
    p_id INT, p_name VARCHAR, p_price DECIMAL, p_description TEXT, p_stock INT, 
    p_manufacturer_id INT, p_concert_id INT, p_price_category VARCHAR, p_genre_ids_json TEXT
) RETURNS BOOLEAN AS $$
DECLARE v_product_id INT; v_genre_ids INT[]; genre_id INT;
BEGIN
    SELECT product_id INTO v_product_id FROM "Ticket" t WHERE t.ticket_id = p_id;
    IF NOT FOUND THEN RETURN FALSE; END IF;
    
    UPDATE "Product" SET 
        name = trim(p_name), price = p_price, description = trim(p_description), 
        stock = p_stock, manufacturer_id = p_manufacturer_id 
    WHERE product_id = v_product_id;
    
    UPDATE "Ticket" SET concert_id = p_concert_id, price_category = trim(p_price_category) 
    WHERE ticket_id = p_id;
    
    DELETE FROM "ProductGenre" WHERE product_id = v_product_id;
    IF p_genre_ids_json IS NOT NULL AND p_genre_ids_json != '' AND p_genre_ids_json != '[]' THEN
        v_genre_ids := ARRAY(SELECT json_array_elements_text(p_genre_ids_json::json)::INT);
        FOREACH genre_id IN ARRAY v_genre_ids LOOP 
            INSERT INTO "ProductGenre" (product_id, genre_id) VALUES (v_product_id, genre_id); 
        END LOOP;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_all_tickets() 
RETURNS TABLE (
    ticket_id INT, product_id INT, name VARCHAR, price DECIMAL, description TEXT, 
    stock INT, manufacturer_id INT, concert_id INT, price_category VARCHAR
) AS $$
BEGIN 
    RETURN QUERY 
    SELECT t.ticket_id, p.product_id, p.name, p.price, p.description, p.stock, 
           p.manufacturer_id, t.concert_id, t.price_category 
    FROM "Ticket" t 
    JOIN "Product" p ON t.product_id = p.product_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_ticket_by_id(p_id INT) 
RETURNS TABLE (
    ticket_id INT, product_id INT, name VARCHAR, price DECIMAL, description TEXT, 
    stock INT, manufacturer_id INT, concert_id INT, price_category VARCHAR
) AS $$
BEGIN 
    RETURN QUERY 
    SELECT t.ticket_id, p.product_id, p.name, p.price, p.description, p.stock, 
           p.manufacturer_id, t.concert_id, t.price_category 
    FROM "Ticket" t 
    JOIN "Product" p ON t.product_id = p.product_id 
    WHERE t.ticket_id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_ticket(p_id INT) RETURNS BOOLEAN AS $$
DECLARE v_product_id INT;
BEGIN
    SELECT product_id INTO v_product_id FROM "Ticket" WHERE ticket_id = p_id;
    IF NOT FOUND THEN RETURN FALSE; END IF;
    
    DELETE FROM "Ticket" WHERE ticket_id = p_id;
    DELETE FROM "Product" WHERE product_id = v_product_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_filtered_tickets(
    p_search_name VARCHAR, p_manufacturer_id INT, p_artist_id INT, p_in_stock BOOLEAN, 
    p_price_min NUMERIC, p_price_max NUMERIC, p_selected_genres VARCHAR
)
RETURNS TABLE (
    ticket_id INT, product_id INT, name VARCHAR, price NUMERIC, description TEXT, stock INT, 
    manufacturer_id INT, type VARCHAR, typeName VARCHAR, concert_id INT, concert_title VARCHAR, 
    price_category VARCHAR, artistNames TEXT, artistIds TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.ticket_id, p.product_id, p.name, p.price, p.description, p.stock,
        p.manufacturer_id, 'ticket'::VARCHAR AS type, 'Билет'::VARCHAR AS typeName,
        t.concert_id, c.title::VARCHAR AS concert_title, t.price_category,
        COALESCE((
            SELECT STRING_AGG(a.name, ', ')
            FROM "ArtistMerch" am
            JOIN "Artist" a ON am.artist_id = a.artist_id
            WHERE am.merch_id = t.ticket_id
        ), '') AS artistNames,
        COALESCE((
            SELECT json_agg(am.artist_id)::TEXT
            FROM "ArtistMerch" am
            WHERE am.merch_id = t.ticket_id
        ), '[]') AS artistIds
    FROM "Ticket" t
    JOIN "Product" p ON t.product_id = p.product_id
    JOIN "Concert" c ON t.concert_id = c.concert_id
    WHERE 1=1
      AND (p_search_name IS NULL OR p.name ILIKE '%' || p_search_name || '%')
      AND (p_manufacturer_id IS NULL OR p.manufacturer_id = p_manufacturer_id)
      AND (p_artist_id IS NULL OR EXISTS (
            SELECT 1 FROM "ArtistMerch" am
            WHERE am.merch_id = t.ticket_id AND am.artist_id = p_artist_id
          ))
      AND (p_in_stock = false OR p.stock > 0)
      AND (p_price_min IS NULL OR p.price >= p_price_min)
      AND (p_price_max IS NULL OR p.price <= p_price_max)
      AND (p_selected_genres IS NULL OR EXISTS (
            SELECT 1 FROM "ProductGenre" pg
            JOIN "Genre" g ON pg.genre_id = g.genre_id
            WHERE pg.product_id = p.product_id AND g.name = ANY(string_to_array(p_selected_genres, ','))
          ));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_concert(
    p_title VARCHAR, p_venue VARCHAR, p_datetime TIMESTAMP, p_artist_ids_json TEXT
)
RETURNS TABLE (
    concert_id INT, title VARCHAR, venue VARCHAR, datetime TIMESTAMP
) AS $$
DECLARE v_concert_id INT; v_artist_ids INT[]; artist_id INT;
BEGIN
    IF p_title IS NULL OR trim(p_title) = '' THEN RAISE EXCEPTION 'Название обязательно'; END IF;
    IF p_venue IS NULL OR trim(p_venue) = '' THEN RAISE EXCEPTION 'Место обязательно'; END IF;
    IF EXISTS (SELECT 1 FROM "Concert" c WHERE c.title = trim(p_title) AND c.venue = trim(p_venue) AND c.datetime = p_datetime) THEN
        RAISE EXCEPTION 'Такой концерт уже существует';
    END IF;
    
    INSERT INTO "Concert" (title, venue, datetime)
    VALUES (trim(p_title), trim(p_venue), p_datetime)
    RETURNING "Concert".concert_id INTO v_concert_id;
    
    IF p_artist_ids_json IS NOT NULL AND p_artist_ids_json != '' AND p_artist_ids_json != '[]' THEN
        v_artist_ids := ARRAY(SELECT json_array_elements_text(p_artist_ids_json::json)::INT);
        FOREACH artist_id IN ARRAY v_artist_ids LOOP
            INSERT INTO "ArtistConcert" (artist_id, concert_id) VALUES (artist_id, v_concert_id);
        END LOOP;
    END IF;
    
    RETURN QUERY SELECT * FROM get_concert_by_id(v_concert_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_concert(
    p_id INT, p_title VARCHAR, p_venue VARCHAR, p_datetime TIMESTAMP, p_artist_ids_json TEXT
) RETURNS BOOLEAN AS $$
DECLARE v_artist_ids INT[]; artist_id INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Concert" c WHERE c.concert_id = p_id) THEN RETURN FALSE; END IF;
    IF EXISTS (SELECT 1 FROM "Concert" c WHERE c.title = trim(p_title) AND c.venue = trim(p_venue) AND c.datetime = p_datetime AND c.concert_id != p_id) THEN
        RAISE EXCEPTION 'Такой концерт уже существует';
    END IF;
    
    UPDATE "Concert" SET title = trim(p_title), venue = trim(p_venue), datetime = p_datetime WHERE concert_id = p_id;
    DELETE FROM "ArtistConcert" WHERE concert_id = p_id;
    
    IF p_artist_ids_json IS NOT NULL AND p_artist_ids_json != '' AND p_artist_ids_json != '[]' THEN
        v_artist_ids := ARRAY(SELECT json_array_elements_text(p_artist_ids_json::json)::INT);
        FOREACH artist_id IN ARRAY v_artist_ids LOOP
            INSERT INTO "ArtistConcert" (artist_id, concert_id) VALUES (artist_id, p_id);
        END LOOP;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_clothing(
    p_name VARCHAR, p_price DECIMAL, p_description TEXT, p_stock INT, p_manufacturer_id INT, 
    p_material VARCHAR, p_color VARCHAR, p_size VARCHAR, p_gender VARCHAR, 
    p_artist_ids_json TEXT, p_genre_ids_json TEXT
)
RETURNS TABLE (
    clothing_id INT, product_id INT, name VARCHAR, price DECIMAL, description TEXT, stock INT, 
    manufacturer_id INT, material VARCHAR, color VARCHAR, size VARCHAR, gender VARCHAR, 
    "artistIds" INT[], "artistNames" TEXT
) AS $$
DECLARE v_product_id INT; v_merch_id INT; v_clothing_id INT; v_artist_ids INT[]; artist_id INT; v_genre_ids INT[]; genre_id INT;
BEGIN
    INSERT INTO "Product" (name, price, description, stock, manufacturer_id) 
    VALUES (trim(p_name), p_price, trim(p_description), p_stock, p_manufacturer_id) 
    RETURNING "Product".product_id INTO v_product_id;
    
    INSERT INTO "Merch" (product_id, material, color) 
    VALUES (v_product_id, trim(p_material), trim(p_color)) 
    RETURNING "Merch".merch_id INTO v_merch_id;
    
    INSERT INTO "Clothing" (merch_id, size, gender) 
    VALUES (v_merch_id, trim(p_size), trim(p_gender)) 
    RETURNING "Clothing".clothing_id INTO v_clothing_id;
    
    IF p_artist_ids_json IS NOT NULL AND p_artist_ids_json != '' AND p_artist_ids_json != '[]' THEN
        v_artist_ids := ARRAY(SELECT json_array_elements_text(p_artist_ids_json::json)::INT);
        FOREACH artist_id IN ARRAY v_artist_ids LOOP INSERT INTO "ArtistMerch" (artist_id, merch_id) VALUES (artist_id, v_merch_id); END LOOP;
    END IF;
    IF p_genre_ids_json IS NOT NULL AND p_genre_ids_json != '' AND p_genre_ids_json != '[]' THEN
        v_genre_ids := ARRAY(SELECT json_array_elements_text(p_genre_ids_json::json)::INT);
        FOREACH genre_id IN ARRAY v_genre_ids LOOP INSERT INTO "ProductGenre" (product_id, genre_id) VALUES (v_product_id, genre_id); END LOOP;
    END IF;
    
    RETURN QUERY SELECT * FROM get_clothing_by_id(v_clothing_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_clothing(
    p_id INT, p_name VARCHAR, p_price DECIMAL, p_description TEXT, p_stock INT, p_manufacturer_id INT, 
    p_material VARCHAR, p_color VARCHAR, p_size VARCHAR, p_gender VARCHAR, 
    p_artist_ids_json TEXT, p_genre_ids_json TEXT
) RETURNS BOOLEAN AS $$
DECLARE v_merch_id INT; v_product_id INT; v_artist_ids INT[]; artist_id INT; v_genre_ids INT[]; genre_id INT;
BEGIN
    SELECT merch_id INTO v_merch_id FROM "Clothing" WHERE clothing_id = p_id;
    IF NOT FOUND THEN RETURN FALSE; END IF;
    SELECT product_id INTO v_product_id FROM "Merch" WHERE merch_id = v_merch_id;
    
    UPDATE "Product" SET name = trim(p_name), price = p_price, description = trim(p_description), stock = p_stock, manufacturer_id = p_manufacturer_id WHERE product_id = v_product_id;
    UPDATE "Merch" SET material = trim(p_material), color = trim(p_color) WHERE merch_id = v_merch_id;
    UPDATE "Clothing" SET size = trim(p_size), gender = trim(p_gender) WHERE clothing_id = p_id;
    
    DELETE FROM "ArtistMerch" WHERE merch_id = v_merch_id;
    DELETE FROM "ProductGenre" WHERE product_id = v_product_id;
    
    IF p_artist_ids_json IS NOT NULL AND p_artist_ids_json != '' AND p_artist_ids_json != '[]' THEN
        v_artist_ids := ARRAY(SELECT json_array_elements_text(p_artist_ids_json::json)::INT);
        FOREACH artist_id IN ARRAY v_artist_ids LOOP INSERT INTO "ArtistMerch" (artist_id, merch_id) VALUES (artist_id, v_merch_id); END LOOP;
    END IF;
    IF p_genre_ids_json IS NOT NULL AND p_genre_ids_json != '' AND p_genre_ids_json != '[]' THEN
        v_genre_ids := ARRAY(SELECT json_array_elements_text(p_genre_ids_json::json)::INT);
        FOREACH genre_id IN ARRAY v_genre_ids LOOP INSERT INTO "ProductGenre" (product_id, genre_id) VALUES (v_product_id, genre_id); END LOOP;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_accessory(
    p_name VARCHAR, p_price DECIMAL, p_description TEXT, p_stock INT, p_manufacturer_id INT, 
    p_material VARCHAR, p_color VARCHAR, p_accessory_type VARCHAR, p_weight DECIMAL, 
    p_artist_ids_json TEXT, p_genre_ids_json TEXT
)
RETURNS TABLE (
    accessory_id INT, product_id INT, name VARCHAR, price DECIMAL, description TEXT, stock INT, 
    manufacturer_id INT, material VARCHAR, color VARCHAR, accessory_type VARCHAR, weight DECIMAL, 
    "artistIds" INT[], "artistNames" TEXT
) AS $$
DECLARE v_product_id INT; v_merch_id INT; v_accessory_id INT; v_artist_ids INT[]; artist_id INT; v_genre_ids INT[]; genre_id INT;
BEGIN
    INSERT INTO "Product" (name, price, description, stock, manufacturer_id) 
    VALUES (trim(p_name), p_price, trim(p_description), p_stock, p_manufacturer_id) 
    RETURNING "Product".product_id INTO v_product_id;
    
    INSERT INTO "Merch" (product_id, material, color) 
    VALUES (v_product_id, trim(p_material), trim(p_color)) 
    RETURNING "Merch".merch_id INTO v_merch_id;
    
    INSERT INTO "Accessory" (merch_id, accessory_type, weight) 
    VALUES (v_merch_id, trim(p_accessory_type), p_weight) 
    RETURNING "Accessory".accessory_id INTO v_accessory_id;
    
    IF p_artist_ids_json IS NOT NULL AND p_artist_ids_json != '' AND p_artist_ids_json != '[]' THEN
        v_artist_ids := ARRAY(SELECT json_array_elements_text(p_artist_ids_json::json)::INT);
        FOREACH artist_id IN ARRAY v_artist_ids LOOP INSERT INTO "ArtistMerch" (artist_id, merch_id) VALUES (artist_id, v_merch_id); END LOOP;
    END IF;
    IF p_genre_ids_json IS NOT NULL AND p_genre_ids_json != '' AND p_genre_ids_json != '[]' THEN
        v_genre_ids := ARRAY(SELECT json_array_elements_text(p_genre_ids_json::json)::INT);
        FOREACH genre_id IN ARRAY v_genre_ids LOOP INSERT INTO "ProductGenre" (product_id, genre_id) VALUES (v_product_id, genre_id); END LOOP;
    END IF;
    
    RETURN QUERY SELECT * FROM get_accessory_by_id(v_accessory_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_accessory(
    p_id INT, p_name VARCHAR, p_price DECIMAL, p_description TEXT, p_stock INT, p_manufacturer_id INT, 
    p_material VARCHAR, p_color VARCHAR, p_accessory_type VARCHAR, p_weight DECIMAL, 
    p_artist_ids_json TEXT, p_genre_ids_json TEXT
) RETURNS BOOLEAN AS $$
DECLARE v_merch_id INT; v_product_id INT; v_artist_ids INT[]; artist_id INT; v_genre_ids INT[]; genre_id INT;
BEGIN
    SELECT merch_id INTO v_merch_id FROM "Accessory" acc WHERE acc.accessory_id = p_id;
    IF NOT FOUND THEN RETURN FALSE; END IF;
    SELECT product_id INTO v_product_id FROM "Merch" m WHERE m.merch_id = v_merch_id;
    
    UPDATE "Product" SET name = trim(p_name), price = p_price, description = trim(p_description), stock = p_stock, manufacturer_id = p_manufacturer_id WHERE product_id = v_product_id;
    UPDATE "Merch" SET material = trim(p_material), color = trim(p_color) WHERE merch_id = v_merch_id;
    UPDATE "Accessory" SET accessory_type = trim(p_accessory_type), weight = p_weight WHERE accessory_id = p_id;
    
    DELETE FROM "ArtistMerch" WHERE merch_id = v_merch_id;
    DELETE FROM "ProductGenre" WHERE product_id = v_product_id;
    
    IF p_artist_ids_json IS NOT NULL AND p_artist_ids_json != '' AND p_artist_ids_json != '[]' THEN
        v_artist_ids := ARRAY(SELECT json_array_elements_text(p_artist_ids_json::json)::INT);
        FOREACH artist_id IN ARRAY v_artist_ids LOOP INSERT INTO "ArtistMerch" (artist_id, merch_id) VALUES (artist_id, v_merch_id); END LOOP;
    END IF;
    IF p_genre_ids_json IS NOT NULL AND p_genre_ids_json != '' AND p_genre_ids_json != '[]' THEN
        v_genre_ids := ARRAY(SELECT json_array_elements_text(p_genre_ids_json::json)::INT);
        FOREACH genre_id IN ARRAY v_genre_ids LOOP INSERT INTO "ProductGenre" (product_id, genre_id) VALUES (v_product_id, genre_id); END LOOP;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_all_accessories()
RETURNS TABLE (
    accessory_id INT,
    product_id INT,
    name VARCHAR,
    price DECIMAL,
    description TEXT,
    stock INT,
    manufacturer_id INT,
    material VARCHAR,
    color VARCHAR,
    accessory_type VARCHAR,
    weight DECIMAL,
    "artistIds" INT[],
    "artistNames" TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.accessory_id,
        p.product_id,
        p.name,
        p.price,
        p.description,
        p.stock,
        p.manufacturer_id,
        m.material,
        m.color,
        a.accessory_type,
        a.weight,
        COALESCE((SELECT ARRAY_AGG(am.artist_id) FROM "ArtistMerch" am WHERE am.merch_id = a.merch_id), ARRAY[]::INT[]) AS "artistIds",
        COALESCE((SELECT STRING_AGG(art.name, ', ') FROM "ArtistMerch" am JOIN "Artist" art ON am.artist_id = art.artist_id WHERE am.merch_id = a.merch_id), '') AS "artistNames"
    FROM "Accessory" a
    JOIN "Merch" m ON a.merch_id = m.merch_id
    JOIN "Product" p ON m.product_id = p.product_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_accessory_by_id(p_id INT)
RETURNS TABLE (
    accessory_id INT,
    product_id INT,
    name VARCHAR,
    price DECIMAL,
    description TEXT,
    stock INT,
    manufacturer_id INT,
    material VARCHAR,
    color VARCHAR,
    accessory_type VARCHAR,
    weight DECIMAL,
    "artistIds" INT[],
    "artistNames" TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.accessory_id,
        p.product_id,
        p.name,
        p.price,
        p.description,
        p.stock,
        p.manufacturer_id,
        m.material,
        m.color,
        a.accessory_type,
        a.weight,
        COALESCE((SELECT ARRAY_AGG(am.artist_id) FROM "ArtistMerch" am WHERE am.merch_id = a.merch_id), ARRAY[]::INT[]) AS "artistIds",
        COALESCE((SELECT STRING_AGG(art.name, ', ') FROM "ArtistMerch" am JOIN "Artist" art ON am.artist_id = art.artist_id WHERE am.merch_id = a.merch_id), '') AS "artistNames"
    FROM "Accessory" a
    JOIN "Merch" m ON a.merch_id = m.merch_id
    JOIN "Product" p ON m.product_id = p.product_id
    WHERE a.accessory_id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_accessory(p_id INT) RETURNS BOOLEAN AS $$
DECLARE v_merch_id INT; v_product_id INT;
BEGIN
    SELECT merch_id INTO v_merch_id FROM "Accessory" acc WHERE acc.accessory_id = p_id;
    IF NOT FOUND THEN RETURN FALSE; END IF;
    SELECT product_id INTO v_product_id FROM "Merch" m WHERE m.merch_id = v_merch_id;
    DELETE FROM "Accessory" WHERE accessory_id = p_id;
    DELETE FROM "Merch" WHERE merch_id = v_merch_id;
    DELETE FROM "Product" WHERE product_id = v_product_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_all_artist_concerts()
RETURNS TABLE (artist_id INT, concert_id INT, artist_name VARCHAR, concert_title VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT ac.artist_id, ac.concert_id, a.name, c.title
    FROM "ArtistConcert" ac JOIN "Artist" a ON ac.artist_id = a.artist_id JOIN "Concert" c ON ac.concert_id = c.concert_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_artist_concert(p_artist_id INT, p_concert_id INT)
RETURNS TABLE (artist_id INT, concert_id INT, artist_name VARCHAR, concert_title VARCHAR) AS $$
BEGIN
    INSERT INTO "ArtistConcert" (artist_id, concert_id) VALUES (p_artist_id, p_concert_id);
    RETURN QUERY SELECT ac.artist_id, ac.concert_id, a.name, c.title
    FROM "ArtistConcert" ac JOIN "Artist" a ON ac.artist_id = a.artist_id JOIN "Concert" c ON ac.concert_id = c.concert_id
    WHERE ac.artist_id = p_artist_id AND ac.concert_id = p_concert_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_artist_concert(p_artist_id INT, p_concert_id INT) RETURNS BOOLEAN AS $$
BEGIN DELETE FROM "ArtistConcert" ac WHERE ac.artist_id = p_artist_id AND ac.concert_id = p_concert_id; RETURN FOUND; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_all_artist_merches()
RETURNS TABLE (artist_id INT, merch_id INT, artist_name VARCHAR, product_name VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT am.artist_id, am.merch_id, a.name, p.name
    FROM "ArtistMerch" am JOIN "Artist" a ON am.artist_id = a.artist_id JOIN "Merch" m ON am.merch_id = m.merch_id JOIN "Product" p ON m.product_id = p.product_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_artist_merch_by_merch(p_merch_id INT)
RETURNS TABLE (artist_id INT, merch_id INT, artist_name VARCHAR, product_name VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT am.artist_id, am.merch_id, a.name, p.name
    FROM "ArtistMerch" am JOIN "Artist" a ON am.artist_id = a.artist_id JOIN "Merch" m ON am.merch_id = m.merch_id JOIN "Product" p ON m.product_id = p.product_id
    WHERE am.merch_id = p_merch_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_artist_merch(p_artist_id INT, p_merch_id INT)
RETURNS TABLE (artist_id INT, merch_id INT, artist_name VARCHAR, product_name VARCHAR) AS $$
BEGIN
    INSERT INTO "ArtistMerch" (artist_id, merch_id) VALUES (p_artist_id, p_merch_id);
    RETURN QUERY SELECT am.artist_id, am.merch_id, a.name, p.name
    FROM "ArtistMerch" am JOIN "Artist" a ON am.artist_id = a.artist_id JOIN "Merch" m ON am.merch_id = m.merch_id JOIN "Product" p ON m.product_id = p.product_id
    WHERE am.artist_id = p_artist_id AND am.merch_id = p_merch_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_artist_merch(p_artist_id INT, p_merch_id INT) RETURNS BOOLEAN AS $$
BEGIN DELETE FROM "ArtistMerch" am WHERE am.artist_id = p_artist_id AND am.merch_id = p_merch_id; RETURN FOUND; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_all_artists()
RETURNS TABLE (artist_id INT, name VARCHAR, country VARCHAR, debut_year INT, language VARCHAR) AS $$
BEGIN RETURN QUERY SELECT a.artist_id, a.name, a.country, a.debut_year, a.language FROM "Artist" a; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_artist_by_id(p_id INT)
RETURNS TABLE (artist_id INT, name VARCHAR, country VARCHAR, debut_year INT, language VARCHAR) AS $$
BEGIN RETURN QUERY SELECT a.artist_id, a.name, a.country, a.debut_year, a.language FROM "Artist" a WHERE a.artist_id = p_id; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_artist(p_name VARCHAR, p_country VARCHAR, p_debut_year INT, p_language VARCHAR)
RETURNS TABLE (artist_id INT, name VARCHAR, country VARCHAR, debut_year INT, language VARCHAR) AS $$
DECLARE v_artist_id INT;
BEGIN
    IF p_name IS NULL OR trim(p_name) = '' THEN RAISE EXCEPTION 'Имя обязательно'; END IF;
    IF EXISTS (SELECT 1 FROM "Artist" a WHERE a.name = trim(p_name)) THEN RAISE EXCEPTION 'Исполнитель с таким именем уже существует'; END IF;
    INSERT INTO "Artist" (name, country, debut_year, language) VALUES (trim(p_name), trim(p_country), p_debut_year, trim(p_language)) RETURNING "Artist".artist_id INTO v_artist_id;
    RETURN QUERY SELECT * FROM get_artist_by_id(v_artist_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_artist(p_id INT, p_name VARCHAR, p_country VARCHAR, p_debut_year INT, p_language VARCHAR) RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Artist" a WHERE a.artist_id = p_id) THEN RETURN FALSE; END IF;
    IF EXISTS (SELECT 1 FROM "Artist" a WHERE a.name = trim(p_name) AND a.artist_id != p_id) THEN RAISE EXCEPTION 'Исполнитель с таким именем уже существует'; END IF;
    UPDATE "Artist" SET name = trim(p_name), country = trim(p_country), debut_year = p_debut_year, language = trim(p_language) WHERE artist_id = p_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_artist(p_id INT) RETURNS BOOLEAN AS $$
BEGIN DELETE FROM "Artist" a WHERE a.artist_id = p_id; RETURN FOUND; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_filtered_artists(p_search_name VARCHAR, p_search_country VARCHAR, p_search_language VARCHAR, p_sort_by VARCHAR)
RETURNS TABLE (artist_id INT, name VARCHAR, country VARCHAR, debut_year INT, language VARCHAR) AS $$
DECLARE query_text TEXT;
BEGIN
    query_text := 'SELECT a.artist_id, a.name, a.country, a.debut_year, a.language FROM "Artist" a WHERE 1=1';
    IF p_search_name IS NOT NULL THEN query_text := query_text || ' AND lower(a.name) LIKE lower(''%' || p_search_name || '%'')'; END IF;
    IF p_search_country IS NOT NULL THEN query_text := query_text || ' AND a.country IS NOT NULL AND lower(a.country) = lower(''' || p_search_country || ''')'; END IF;
    IF p_search_language = 'Instrumental' THEN query_text := query_text || ' AND a.language IS NULL';
    ELSIF p_search_language IS NOT NULL THEN query_text := query_text || ' AND a.language IS NOT NULL AND lower(a.language) = lower(''' || p_search_language || ''')'; END IF;
    IF p_sort_by = 'name_desc' THEN query_text := query_text || ' ORDER BY a.name DESC';
    ELSE query_text := query_text || ' ORDER BY a.name ASC'; END IF;
    RETURN QUERY EXECUTE query_text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_cart(p_user_id INT)
RETURNS TABLE (product_id INT, name VARCHAR, price DECIMAL, quantity INT, added_date TIMESTAMP) AS $$
BEGIN
    RETURN QUERY SELECT c.product_id, p.name, p.price, c.quantity, c.added_date FROM "Cart" c JOIN "Product" p ON c.product_id = p.product_id WHERE c.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_to_cart(p_user_id INT, p_product_id INT, p_quantity INT) RETURNS INT AS $$
DECLARE v_current_quantity INT;
BEGIN
    SELECT quantity INTO v_current_quantity FROM "Cart" c WHERE c.user_id = p_user_id AND c.product_id = p_product_id;
    IF FOUND THEN
        UPDATE "Cart" SET quantity = quantity + p_quantity, added_date = NOW() WHERE user_id = p_user_id AND product_id = p_product_id;
        RETURN (SELECT quantity FROM "Cart" WHERE user_id = p_user_id AND product_id = p_product_id);
    ELSE
        INSERT INTO "Cart" (user_id, product_id, quantity, added_date) VALUES (p_user_id, p_product_id, p_quantity, NOW());
        RETURN p_quantity;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_from_cart(p_user_id INT, p_product_id INT, p_quantity INT) RETURNS BOOLEAN AS $$
DECLARE v_current_quantity INT;
BEGIN
    SELECT quantity INTO v_current_quantity FROM "Cart" c WHERE c.user_id = p_user_id AND c.product_id = p_product_id;
    IF NOT FOUND THEN RETURN FALSE; END IF;
    IF p_quantity > 0 AND p_quantity < v_current_quantity THEN
        UPDATE "Cart" SET quantity = quantity - p_quantity WHERE user_id = p_user_id AND product_id = p_product_id;
    ELSE DELETE FROM "Cart" WHERE user_id = p_user_id AND product_id = p_product_id; END IF;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION checkout_cart(p_user_id INT) RETURNS TABLE (order_id INT, total_amount DECIMAL) AS $$
DECLARE v_order_id INT; v_total DECIMAL; v_cart_item RECORD;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Cart" c WHERE c.user_id = p_user_id) THEN RAISE EXCEPTION 'Корзина пуста'; END IF;
    SELECT SUM(c.quantity * p.price) INTO v_total FROM "Cart" c JOIN "Product" p ON c.product_id = p.product_id WHERE c.user_id = p_user_id;
    INSERT INTO "Order" (user_id, order_date, status, total_amount) VALUES (p_user_id, NOW(), 'pending', v_total) RETURNING "Order".order_id INTO v_order_id;
    FOR v_cart_item IN SELECT c.product_id, c.quantity, p.price FROM "Cart" c JOIN "Product" p ON c.product_id = p.product_id WHERE c.user_id = p_user_id LOOP
        INSERT INTO "OrderItem" (order_id, product_id, quantity, unit_price) VALUES (v_order_id, v_cart_item.product_id, v_cart_item.quantity, v_cart_item.price);
    END LOOP;
    DELETE FROM "Cart" WHERE user_id = p_user_id;
    RETURN QUERY SELECT v_order_id, v_total;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_filtered_cart(p_user_id INT, p_search_name VARCHAR, p_sort_by VARCHAR)
RETURNS TABLE (product_id INT, name VARCHAR, price DECIMAL, quantity INT, added_date TIMESTAMP) AS $$
DECLARE query_text TEXT;
BEGIN
    query_text := 'SELECT c.product_id, p.name, p.price, c.quantity, c.added_date FROM "Cart" c JOIN "Product" p ON c.product_id = p.product_id WHERE c.user_id = ' || p_user_id;
    IF p_search_name IS NOT NULL THEN query_text := query_text || ' AND lower(p.name) LIKE lower(''%' || p_search_name || '%'')'; END IF;
    IF p_sort_by = 'price_asc' THEN query_text := query_text || ' ORDER BY p.price ASC';
    ELSIF p_sort_by = 'price_desc' THEN query_text := query_text || ' ORDER BY p.price DESC';
    ELSIF p_sort_by = 'date_asc' THEN query_text := query_text || ' ORDER BY c.added_date ASC';
    ELSE query_text := query_text || ' ORDER BY c.added_date DESC'; END IF;
    RETURN QUERY EXECUTE query_text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_all_clothings()
RETURNS TABLE (clothing_id INT, product_id INT, name VARCHAR, price DECIMAL, description TEXT, stock INT, manufacturer_id INT, material VARCHAR, color VARCHAR, size VARCHAR, gender VARCHAR, artistIds INT[], artistNames TEXT) AS $$
BEGIN
    RETURN QUERY SELECT c.clothing_id, p.product_id, p.name, p.price, p.description, p.stock, p.manufacturer_id, m.material, m.color, c.size, c.gender,
        COALESCE((SELECT ARRAY_AGG(am.artist_id) FROM "ArtistMerch" am WHERE am.merch_id = c.merch_id), ARRAY[]::INT[]),
        COALESCE((SELECT STRING_AGG(art.name, ', ') FROM "ArtistMerch" am JOIN "Artist" art ON am.artist_id = art.artist_id WHERE am.merch_id = c.merch_id), '')
    FROM "Clothing" c JOIN "Merch" m ON c.merch_id = m.merch_id JOIN "Product" p ON m.product_id = p.product_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_clothing_by_id(p_id INT)
RETURNS TABLE (clothing_id INT, product_id INT, name VARCHAR, price DECIMAL, description TEXT, stock INT, manufacturer_id INT, material VARCHAR, color VARCHAR, size VARCHAR, gender VARCHAR, artistIds INT[], artistNames TEXT) AS $$
BEGIN
    RETURN QUERY SELECT c.clothing_id, p.product_id, p.name, p.price, p.description, p.stock, p.manufacturer_id, m.material, m.color, c.size, c.gender,
        COALESCE((SELECT ARRAY_AGG(am.artist_id) FROM "ArtistMerch" am WHERE am.merch_id = c.merch_id), ARRAY[]::INT[]),
        COALESCE((SELECT STRING_AGG(art.name, ', ') FROM "ArtistMerch" am JOIN "Artist" art ON am.artist_id = art.artist_id WHERE am.merch_id = c.merch_id), '')
    FROM "Clothing" c JOIN "Merch" m ON c.merch_id = m.merch_id JOIN "Product" p ON m.product_id = p.product_id WHERE c.clothing_id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_clothing(p_id INT) RETURNS BOOLEAN AS $$
DECLARE v_merch_id INT; v_product_id INT;
BEGIN
    SELECT merch_id INTO v_merch_id FROM "Clothing" cl WHERE cl.clothing_id = p_id;
    IF NOT FOUND THEN RETURN FALSE; END IF;
    SELECT product_id INTO v_product_id FROM "Merch" m WHERE m.merch_id = v_merch_id;
    DELETE FROM "Clothing" WHERE clothing_id = p_id; DELETE FROM "Merch" WHERE merch_id = v_merch_id; DELETE FROM "Product" WHERE product_id = v_product_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_all_concerts()
RETURNS TABLE (concert_id INT, title VARCHAR, venue VARCHAR, datetime TIMESTAMP) AS $$
BEGIN RETURN QUERY SELECT c.concert_id, c.title, c.venue, c.datetime FROM "Concert" c; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_concert_by_id(p_id INT)
RETURNS TABLE (concert_id INT, title VARCHAR, venue VARCHAR, datetime TIMESTAMP) AS $$
BEGIN RETURN QUERY SELECT c.concert_id, c.title, c.venue, c.datetime FROM "Concert" c WHERE c.concert_id = p_id; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_filtered_concerts(p_search_title VARCHAR, p_search_venue VARCHAR, p_status VARCHAR, p_artist_id INT, p_sort_by VARCHAR)
RETURNS TABLE (concert_id INT, title VARCHAR, venue VARCHAR, datetime TIMESTAMP, artistNames TEXT, artistIds INT[]) AS $$
DECLARE now_time TIMESTAMP := NOW(); query_text TEXT;
BEGIN
    query_text := 'SELECT c.concert_id, c.title, c.venue, c.datetime, COALESCE((SELECT STRING_AGG(a.name, '', '') FROM "ArtistConcert" ac JOIN "Artist" a ON ac.artist_id = a.artist_id WHERE ac.concert_id = c.concert_id), ''''), COALESCE((SELECT ARRAY_AGG(ac.artist_id) FROM "ArtistConcert" ac WHERE ac.concert_id = c.concert_id), ARRAY[]::INT[]) FROM "Concert" c WHERE 1=1';
    IF p_search_title IS NOT NULL THEN query_text := query_text || ' AND lower(c.title) LIKE lower(''%' || p_search_title || '%'')'; END IF;
    IF p_search_venue IS NOT NULL THEN query_text := query_text || ' AND lower(c.venue) LIKE lower(''%' || p_search_venue || '%'')'; END IF;
    IF p_status = 'upcoming' THEN query_text := query_text || ' AND c.datetime >= ''' || now_time || '''';
    ELSIF p_status = 'past' THEN query_text := query_text || ' AND c.datetime < ''' || now_time || ''''; END IF;
    IF p_artist_id IS NOT NULL THEN query_text := query_text || ' AND EXISTS (SELECT 1 FROM "ArtistConcert" ac WHERE ac.concert_id = c.concert_id AND ac.artist_id = ' || p_artist_id || ')'; END IF;
    IF p_sort_by = 'date_desc' THEN query_text := query_text || ' ORDER BY c.datetime DESC'; ELSE query_text := query_text || ' ORDER BY c.datetime ASC'; END IF;
    RETURN QUERY EXECUTE query_text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_artists_for_concert_filter() RETURNS TABLE (artist_id INT, name VARCHAR) AS $$
BEGIN RETURN QUERY SELECT a.artist_id, a.name FROM "Artist" a ORDER BY a.name; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_concert(p_id INT) RETURNS BOOLEAN AS $$
BEGIN DELETE FROM "Concert" c WHERE c.concert_id = p_id; RETURN FOUND; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_all_genres()
RETURNS TABLE (genre_id INT, name VARCHAR, description TEXT) AS $$
BEGIN RETURN QUERY SELECT g.genre_id, g.name, g.description FROM "Genre" g; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_genre_by_id(p_id INT)
RETURNS TABLE (genre_id INT, name VARCHAR, description TEXT) AS $$
BEGIN RETURN QUERY SELECT g.genre_id, g.name, g.description FROM "Genre" g WHERE g.genre_id = p_id; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_genre(p_name VARCHAR, p_description TEXT)
RETURNS TABLE (genre_id INT, name VARCHAR, description TEXT) AS $$
DECLARE v_genre_id INT;
BEGIN
    IF p_name IS NULL OR trim(p_name) = '' THEN RAISE EXCEPTION 'Название обязательно'; END IF;
    IF EXISTS (SELECT 1 FROM "Genre" g WHERE g.name = trim(p_name)) THEN RAISE EXCEPTION 'Жанр с таким названием уже существует'; END IF;
    INSERT INTO "Genre" (name, description) VALUES (trim(p_name), trim(p_description)) RETURNING "Genre".genre_id INTO v_genre_id;
    RETURN QUERY SELECT * FROM get_genre_by_id(v_genre_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_genre(p_id INT, p_name VARCHAR, p_description TEXT) RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Genre" g WHERE g.genre_id = p_id) THEN RETURN FALSE; END IF;
    IF EXISTS (SELECT 1 FROM "Genre" g WHERE g.name = trim(p_name) AND g.genre_id != p_id) THEN RAISE EXCEPTION 'Жанр с таким названием уже существует'; END IF;
    UPDATE "Genre" SET name = trim(p_name), description = trim(p_description) WHERE genre_id = p_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_genre(p_id INT) RETURNS BOOLEAN AS $$
BEGIN DELETE FROM "Genre" g WHERE g.genre_id = p_id; RETURN FOUND; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_filtered_genres(p_search_name VARCHAR, p_sort_by VARCHAR)
RETURNS TABLE (genre_id INT, name VARCHAR, description TEXT) AS $$
DECLARE query_text TEXT;
BEGIN
    query_text := 'SELECT g.genre_id, g.name, g.description FROM "Genre" g WHERE 1=1';
    IF p_search_name IS NOT NULL THEN query_text := query_text || ' AND lower(g.name) LIKE lower(''%' || p_search_name || '%'')'; END IF;
    IF p_sort_by = 'name_desc' THEN query_text := query_text || ' ORDER BY g.name DESC'; ELSE query_text := query_text || ' ORDER BY g.name ASC'; END IF;
    RETURN QUERY EXECUTE query_text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_genre_names() RETURNS TABLE (name VARCHAR) AS $$
BEGIN RETURN QUERY SELECT g.name FROM "Genre" g; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_all_manufacturers()
RETURNS TABLE (manufacturer_id INT, name VARCHAR, contact_info VARCHAR, country VARCHAR) AS $$
BEGIN RETURN QUERY SELECT m.manufacturer_id, m.name, m.contact_info, m.country FROM "Manufacturer" m; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_manufacturer_by_id(p_id INT)
RETURNS TABLE (manufacturer_id INT, name VARCHAR, contact_info VARCHAR, country VARCHAR) AS $$
BEGIN RETURN QUERY SELECT m.manufacturer_id, m.name, m.contact_info, m.country FROM "Manufacturer" m WHERE m.manufacturer_id = p_id; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_manufacturer(p_name VARCHAR, p_contact_info VARCHAR, p_country VARCHAR)
RETURNS TABLE (manufacturer_id INT, name VARCHAR, contact_info VARCHAR, country VARCHAR) AS $$
DECLARE v_manufacturer_id INT;
BEGIN
    IF p_name IS NULL OR trim(p_name) = '' THEN RAISE EXCEPTION 'Название обязательно'; END IF;
    IF EXISTS (SELECT 1 FROM "Manufacturer" m WHERE m.name = trim(p_name)) THEN RAISE EXCEPTION 'Производитель с таким названием уже существует'; END IF;
    INSERT INTO "Manufacturer" (name, contact_info, country) VALUES (trim(p_name), trim(p_contact_info), trim(p_country)) RETURNING "Manufacturer".manufacturer_id INTO v_manufacturer_id;
    RETURN QUERY SELECT * FROM get_manufacturer_by_id(v_manufacturer_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_manufacturer(p_id INT, p_name VARCHAR, p_contact_info VARCHAR, p_country VARCHAR) RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Manufacturer" m WHERE m.manufacturer_id = p_id) THEN RETURN FALSE; END IF;
    IF EXISTS (SELECT 1 FROM "Manufacturer" m WHERE m.name = trim(p_name) AND m.manufacturer_id != p_id) THEN RAISE EXCEPTION 'Производитель с таким названием уже существует'; END IF;
    UPDATE "Manufacturer" SET name = trim(p_name), contact_info = trim(p_contact_info), country = trim(p_country) WHERE manufacturer_id = p_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_manufacturer(p_id INT) RETURNS BOOLEAN AS $$
BEGIN DELETE FROM "Manufacturer" m WHERE m.manufacturer_id = p_id; RETURN FOUND; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_filtered_manufacturers(p_search_name VARCHAR, p_search_country VARCHAR, p_sort_by VARCHAR)
RETURNS TABLE (manufacturer_id INT, name VARCHAR, contact_info VARCHAR, country VARCHAR) AS $$
DECLARE query_text TEXT;
BEGIN
    query_text := 'SELECT m.manufacturer_id, m.name, m.contact_info, m.country FROM "Manufacturer" m WHERE 1=1';
    IF p_search_name IS NOT NULL THEN query_text := query_text || ' AND lower(m.name) LIKE lower(''%' || p_search_name || '%'')'; END IF;
    IF p_search_country IS NOT NULL THEN query_text := query_text || ' AND m.country IS NOT NULL AND lower(m.country) LIKE lower(''%' || p_search_country || '%'')'; END IF;
    IF p_sort_by = 'name_desc' THEN query_text := query_text || ' ORDER BY m.name DESC'; ELSE query_text := query_text || ' ORDER BY m.name ASC'; END IF;
    RETURN QUERY EXECUTE query_text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_manufacturer_names() RETURNS TABLE (name VARCHAR) AS $$
BEGIN RETURN QUERY SELECT m.name FROM "Manufacturer" m; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_manufacturer_countries() RETURNS TABLE (country VARCHAR) AS $$
BEGIN RETURN QUERY SELECT DISTINCT m.country FROM "Manufacturer" m WHERE m.country IS NOT NULL; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_all_merches()
RETURNS TABLE (merch_id INT, product_id INT, material VARCHAR, color VARCHAR) AS $$
BEGIN RETURN QUERY SELECT m.merch_id, m.product_id, m.material, m.color FROM "Merch" m; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_merch_by_id(p_id INT)
RETURNS TABLE (merch_id INT, product_id INT, material VARCHAR, color VARCHAR) AS $$
BEGIN RETURN QUERY SELECT m.merch_id, m.product_id, m.material, m.color FROM "Merch" m WHERE m.merch_id = p_id; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_merch(p_product_id INT, p_material VARCHAR, p_color VARCHAR)
RETURNS TABLE (merch_id INT, product_id INT, material VARCHAR, color VARCHAR) AS $$
DECLARE v_merch_id INT;
BEGIN
    INSERT INTO "Merch" (product_id, material, color) VALUES (p_product_id, trim(p_material), trim(p_color)) RETURNING "Merch".merch_id INTO v_merch_id;
    RETURN QUERY SELECT * FROM get_merch_by_id(v_merch_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_merch(p_id INT, p_product_id INT, p_material VARCHAR, p_color VARCHAR) RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Merch" m WHERE m.merch_id = p_id) THEN RETURN FALSE; END IF;
    UPDATE "Merch" SET product_id = p_product_id, material = trim(p_material), color = trim(p_color) WHERE merch_id = p_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_merch(p_id INT) RETURNS BOOLEAN AS $$
BEGIN DELETE FROM "Merch" m WHERE m.merch_id = p_id; RETURN FOUND; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_all_order_items()
RETURNS TABLE (order_id INT, product_id INT, quantity INT, unit_price DECIMAL) AS $$
BEGIN RETURN QUERY SELECT oi.order_id, oi.product_id, oi.quantity, oi.unit_price FROM "OrderItem" oi; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_order_item_by_id(p_id INT)
RETURNS TABLE (order_id INT, product_id INT, quantity INT, unit_price DECIMAL) AS $$
BEGIN RETURN QUERY SELECT oi.order_id, oi.product_id, oi.quantity, oi.unit_price FROM "OrderItem" oi WHERE oi.order_id = p_id; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_order_item(p_order_id INT, p_product_id INT, p_quantity INT, p_unit_price DECIMAL)
RETURNS TABLE (order_id INT, product_id INT, quantity INT, unit_price DECIMAL) AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM "OrderItem" oi WHERE oi.order_id = p_order_id AND oi.product_id = p_product_id) THEN RAISE EXCEPTION 'OrderItem already exists'; END IF;
    INSERT INTO "OrderItem" (order_id, product_id, quantity, unit_price) VALUES (p_order_id, p_product_id, p_quantity, p_unit_price);
    RETURN QUERY SELECT * FROM get_order_item_by_id(p_order_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_order_item(p_id INT, p_order_id INT, p_product_id INT, p_quantity INT, p_unit_price DECIMAL) RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "OrderItem" oi WHERE oi.order_id = p_id AND oi.product_id = p_product_id) THEN RETURN FALSE; END IF;
    UPDATE "OrderItem" SET quantity = p_quantity, unit_price = p_unit_price WHERE order_id = p_id AND product_id = p_product_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_order_item(p_id INT) RETURNS BOOLEAN AS $$
BEGIN DELETE FROM "OrderItem" oi WHERE oi.order_id = p_id; RETURN FOUND; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_order_items_by_order(p_order_id INT)
RETURNS TABLE (product_id INT, product_name VARCHAR, quantity INT, unit_price DECIMAL, total_price DECIMAL) AS $$
BEGIN
    RETURN QUERY SELECT oi.product_id, p.name, oi.quantity, oi.unit_price, (oi.quantity * oi.unit_price) FROM "OrderItem" oi JOIN "Product" p ON oi.product_id = p.product_id WHERE oi.order_id = p_order_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_all_orders()
RETURNS TABLE (order_id INT, user_id INT, order_date TIMESTAMP, status VARCHAR, total_amount DECIMAL) AS $$
BEGIN RETURN QUERY SELECT o.order_id, o.user_id, o.order_date, o.status, o.total_amount FROM "Order" o; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_order_by_id(p_id INT)
RETURNS TABLE (order_id INT, user_id INT, order_date TIMESTAMP, status VARCHAR, total_amount DECIMAL) AS $$
BEGIN RETURN QUERY SELECT o.order_id, o.user_id, o.order_date, o.status, o.total_amount FROM "Order" o WHERE o.order_id = p_id; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_orders_by_user(p_user_id INT)
RETURNS TABLE (order_id INT, order_date TIMESTAMP, status VARCHAR, total_amount DECIMAL) AS $$
BEGIN RETURN QUERY SELECT o.order_id, o.order_date, o.status, o.total_amount FROM "Order" o WHERE o.user_id = p_user_id ORDER BY o.order_date DESC; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_orders_with_items(p_user_id INT)
RETURNS TABLE (order_id INT, user_id INT, user_name VARCHAR, user_login VARCHAR, order_date TIMESTAMP, status VARCHAR, total_amount DECIMAL, items_json TEXT) AS $$
DECLARE order_record RECORD; items_json TEXT; items_array JSONB;
BEGIN
    FOR order_record IN SELECT o.order_id, o.user_id, u.full_name, u.login, o.order_date, o.status, o.total_amount FROM "Order" o JOIN "User" u ON o.user_id = u.user_id WHERE o.user_id = p_user_id ORDER BY o.order_date DESC LOOP
        SELECT jsonb_agg(jsonb_build_object('product_id', oi.product_id, 'product_name', p.name, 'quantity', oi.quantity, 'unit_price', oi.unit_price, 'total_price', oi.quantity * oi.unit_price)) INTO items_array FROM "OrderItem" oi JOIN "Product" p ON oi.product_id = p.product_id WHERE oi.order_id = order_record.order_id;
        items_json := COALESCE(items_array::TEXT, '[]');
        RETURN QUERY SELECT order_record.order_id, order_record.user_id, order_record.full_name, order_record.login, order_record.order_date, order_record.status, order_record.total_amount, items_json;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_order(p_user_id INT, p_order_date TIMESTAMP, p_status VARCHAR, p_total_amount DECIMAL)
RETURNS TABLE (order_id INT, user_id INT, order_date TIMESTAMP, status VARCHAR, total_amount DECIMAL) AS $$
DECLARE v_order_id INT;
BEGIN
    INSERT INTO "Order" (user_id, order_date, status, total_amount) VALUES (p_user_id, p_order_date, p_status, p_total_amount) RETURNING "Order".order_id INTO v_order_id;
    RETURN QUERY SELECT * FROM get_order_by_id(v_order_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_order(p_id INT, p_user_id INT, p_order_date TIMESTAMP, p_status VARCHAR, p_total_amount DECIMAL) RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Order" o WHERE o.order_id = p_id) THEN RETURN FALSE; END IF;
    UPDATE "Order" SET user_id = p_user_id, order_date = p_order_date, status = p_status, total_amount = p_total_amount WHERE order_id = p_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_order(p_id INT) RETURNS BOOLEAN AS $$
BEGIN DELETE FROM "Order" o WHERE o.order_id = p_id; RETURN FOUND; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_all_product_genres()
RETURNS TABLE (product_id INT, genre_id INT, product_name VARCHAR, genre_name VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT pg.product_id, pg.genre_id, p.name, g.name FROM "ProductGenre" pg JOIN "Product" p ON pg.product_id = p.product_id JOIN "Genre" g ON pg.genre_id = g.genre_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_product_genre(p_product_id INT, p_genre_id INT)
RETURNS TABLE (product_id INT, genre_id INT, product_name VARCHAR, genre_name VARCHAR) AS $$
BEGIN
    INSERT INTO "ProductGenre" (product_id, genre_id) VALUES (p_product_id, p_genre_id);
    RETURN QUERY SELECT pg.product_id, pg.genre_id, p.name, g.name FROM "ProductGenre" pg JOIN "Product" p ON pg.product_id = p.product_id JOIN "Genre" g ON pg.genre_id = g.genre_id WHERE pg.product_id = p_product_id AND pg.genre_id = p_genre_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_product_genre(p_product_id INT, p_genre_id INT) RETURNS BOOLEAN AS $$
BEGIN DELETE FROM "ProductGenre" pg WHERE pg.product_id = p_product_id AND pg.genre_id = p_genre_id; RETURN FOUND; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_reviews_by_user(p_user_id INT)
RETURNS TABLE (product_id INT, product_name VARCHAR, rating INT, review_text TEXT, review_date TIMESTAMP) AS $$
BEGIN
    RETURN QUERY SELECT r.product_id, p.name, r.rating, r.review_text, r.review_date FROM "Review" r JOIN "Product" p ON r.product_id = p.product_id WHERE r.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_filtered_reviews(p_user_id INT, p_search_name VARCHAR, p_rating INT, p_sort_by VARCHAR)
RETURNS TABLE (product_id INT, product_name VARCHAR, rating INT, review_text TEXT, review_date TIMESTAMP) AS $$
DECLARE query_text TEXT;
BEGIN
    query_text := 'SELECT r.product_id, p.name, r.rating, r.review_text, r.review_date FROM "Review" r JOIN "Product" p ON r.product_id = p.product_id WHERE r.user_id = ' || p_user_id;
    IF p_search_name IS NOT NULL THEN query_text := query_text || ' AND lower(p.name) LIKE lower(''%' || p_search_name || '%'')'; END IF;
    IF p_rating IS NOT NULL THEN query_text := query_text || ' AND r.rating = ' || p_rating; END IF;
    IF p_sort_by = 'rating_asc' THEN query_text := query_text || ' ORDER BY r.rating ASC';
    ELSIF p_sort_by = 'rating_desc' THEN query_text := query_text || ' ORDER BY r.rating DESC';
    ELSIF p_sort_by = 'date_asc' THEN query_text := query_text || ' ORDER BY r.review_date ASC';
    ELSE query_text := query_text || ' ORDER BY r.review_date DESC'; END IF;
    RETURN QUERY EXECUTE query_text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_review(p_user_id INT, p_product_id INT, p_rating INT, p_review_text TEXT) RETURNS VOID AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Review" r WHERE r.user_id = p_user_id AND r.product_id = p_product_id) THEN RAISE EXCEPTION 'Вы уже оставляли отзыв на этот товар'; END IF;
    INSERT INTO "Review" (user_id, product_id, rating, review_text, review_date) VALUES (p_user_id, p_product_id, p_rating, trim(p_review_text), NOW());
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_review(p_user_id INT, p_product_id INT) RETURNS BOOLEAN AS $$
BEGIN DELETE FROM "Review" r WHERE r.user_id = p_user_id AND r.product_id = p_product_id; RETURN FOUND; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (user_id INT, login VARCHAR, email VARCHAR, registration_date DATE, full_name VARCHAR, password_hash VARCHAR) AS $$
BEGIN RETURN QUERY SELECT u.user_id, u.login, u.email, u.registration_date, u.full_name, u.password_hash FROM "User" u; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_by_id(p_id INT)
RETURNS TABLE (user_id INT, login VARCHAR, email VARCHAR, registration_date DATE, full_name VARCHAR, password_hash VARCHAR) AS $$
BEGIN RETURN QUERY SELECT u.user_id, u.login, u.email, u.registration_date, u.full_name, u.password_hash FROM "User" u WHERE u.user_id = p_id; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_user(p_login VARCHAR, p_email VARCHAR, p_full_name VARCHAR, p_password VARCHAR)
RETURNS TABLE (user_id INT, login VARCHAR, email VARCHAR, registration_date DATE, full_name VARCHAR, password_hash VARCHAR) AS $$
DECLARE v_user_id INT;
BEGIN
    IF p_login IS NULL OR trim(p_login) = '' THEN RAISE EXCEPTION 'Логин обязателен'; END IF;
    IF p_password IS NULL OR trim(p_password) = '' THEN RAISE EXCEPTION 'Пароль обязателен'; END IF;
    IF EXISTS (SELECT 1 FROM "User" u WHERE u.login = trim(p_login)) THEN RAISE EXCEPTION 'Логин уже существует'; END IF;
    IF EXISTS (SELECT 1 FROM "User" u WHERE u.email = trim(p_email)) THEN RAISE EXCEPTION 'Email уже существует'; END IF;
    INSERT INTO "User" (login, email, registration_date, full_name, password_hash) VALUES (trim(p_login), trim(p_email), CURRENT_DATE, trim(p_full_name), trim(p_password)) RETURNING "User".user_id INTO v_user_id;
    RETURN QUERY SELECT * FROM get_user_by_id(v_user_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user(p_id INT, p_login VARCHAR, p_email VARCHAR, p_full_name VARCHAR, p_password VARCHAR) RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "User" u WHERE u.user_id = p_id) THEN RETURN FALSE; END IF;
    IF EXISTS (SELECT 1 FROM "User" u WHERE u.login = trim(p_login) AND u.user_id != p_id) THEN RAISE EXCEPTION 'Логин уже занят другим пользователем'; END IF;
    IF EXISTS (SELECT 1 FROM "User" u WHERE u.email = trim(p_email) AND u.user_id != p_id) THEN RAISE EXCEPTION 'Email уже занят другим пользователем'; END IF;
    UPDATE "User" SET login = trim(p_login), email = trim(p_email), full_name = trim(p_full_name), password_hash = COALESCE(trim(p_password), password_hash) WHERE user_id = p_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_user(p_id INT) RETURNS BOOLEAN AS $$
BEGIN DELETE FROM "User" u WHERE u.user_id = p_id; RETURN FOUND; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_all_wishlists()
RETURNS TABLE (user_id INT, product_id INT, added_date TIMESTAMP) AS $$
BEGIN RETURN QUERY SELECT w.user_id, w.product_id, w.added_date FROM "Wishlist" w; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_wishlist_by_user(p_user_id INT)
RETURNS TABLE (product_id INT, name VARCHAR, price DECIMAL, added_date TIMESTAMP) AS $$
BEGIN
    RETURN QUERY SELECT w.product_id, p.name, p.price, w.added_date FROM "Wishlist" w JOIN "Product" p ON w.product_id = p.product_id WHERE w.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_wishlist(p_user_id INT, p_product_id INT) RETURNS VOID AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Wishlist" w WHERE w.user_id = p_user_id AND w.product_id = p_product_id) THEN RAISE EXCEPTION 'Товар уже в вишлисте'; END IF;
    INSERT INTO "Wishlist" (user_id, product_id, added_date) VALUES (p_user_id, p_product_id, NOW());
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_wishlist(p_user_id INT, p_product_id INT) RETURNS BOOLEAN AS $$
BEGIN DELETE FROM "Wishlist" w WHERE w.user_id = p_user_id AND w.product_id = p_product_id; RETURN FOUND; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_filtered_wishlist(p_user_id INT, p_search_name VARCHAR, p_sort_by VARCHAR)
RETURNS TABLE (product_id INT, name VARCHAR, price DECIMAL, added_date TIMESTAMP) AS $$
DECLARE query_text TEXT;
BEGIN
    query_text := 'SELECT w.product_id, p.name, p.price, w.added_date FROM "Wishlist" w JOIN "Product" p ON w.product_id = p.product_id WHERE w.user_id = ' || p_user_id;
    IF p_search_name IS NOT NULL THEN query_text := query_text || ' AND lower(p.name) LIKE lower(''%' || p_search_name || '%'')'; END IF;
    IF p_sort_by = 'price_asc' THEN query_text := query_text || ' ORDER BY p.price ASC';
    ELSIF p_sort_by = 'price_desc' THEN query_text := query_text || ' ORDER BY p.price DESC';
    ELSIF p_sort_by = 'date_asc' THEN query_text := query_text || ' ORDER BY w.added_date ASC';
    ELSE query_text := query_text || ' ORDER BY w.added_date DESC'; END IF;
    RETURN QUERY EXECUTE query_text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_all_products()
RETURNS TABLE (product_id INT, name VARCHAR, price DECIMAL, description TEXT, stock INT, manufacturer_id INT) AS $$
BEGIN RETURN QUERY SELECT p.product_id, p.name, p.price, p.description, p.stock, p.manufacturer_id FROM "Product" p; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_product_by_id(p_id INT)
RETURNS TABLE (product_id INT, name VARCHAR, price DECIMAL, description TEXT, stock INT, manufacturer_id INT) AS $$
BEGIN RETURN QUERY SELECT p.product_id, p.name, p.price, p.description, p.stock, p.manufacturer_id FROM "Product" p WHERE p.product_id = p_id; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_product(p_name VARCHAR, p_price DECIMAL, p_description TEXT, p_stock INT, p_manufacturer_id INT)
RETURNS TABLE (product_id INT, name VARCHAR, price DECIMAL, description TEXT, stock INT, manufacturer_id INT) AS $$
DECLARE v_product_id INT;
BEGIN
    IF p_name IS NULL OR trim(p_name) = '' THEN RAISE EXCEPTION 'Название товара обязательно'; END IF;
    IF p_manufacturer_id IS NULL OR p_manufacturer_id = 0 THEN RAISE EXCEPTION 'Производитель обязателен'; END IF;
    IF EXISTS (SELECT 1 FROM "Product" p WHERE p.name = trim(p_name)) THEN RAISE EXCEPTION 'Товар с таким названием уже существует'; END IF;
    INSERT INTO "Product" (name, price, description, stock, manufacturer_id) VALUES (trim(p_name), p_price, trim(p_description), p_stock, p_manufacturer_id) RETURNING "Product".product_id INTO v_product_id;
    RETURN QUERY SELECT * FROM get_product_by_id(v_product_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_product(p_id INT, p_name VARCHAR, p_price DECIMAL, p_description TEXT, p_stock INT, p_manufacturer_id INT) RETURNS BOOLEAN AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Product" p WHERE p.product_id = p_id) THEN RETURN FALSE; END IF;
    IF EXISTS (SELECT 1 FROM "Product" p WHERE p.name = trim(p_name) AND p.product_id != p_id) THEN RAISE EXCEPTION 'Товар с таким названием уже существует'; END IF;
    UPDATE "Product" SET name = trim(p_name), price = p_price, description = trim(p_description), stock = p_stock, manufacturer_id = p_manufacturer_id WHERE product_id = p_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_product(p_id INT) RETURNS BOOLEAN AS $$
BEGIN DELETE FROM "Product" p WHERE p.product_id = p_id; RETURN FOUND; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_filtered_clothings(
    p_search_name VARCHAR,
    p_manufacturer_id INT,
    p_artist_id INT,
    p_in_stock BOOLEAN,
    p_price_min NUMERIC,
    p_price_max NUMERIC,
    p_selected_genres VARCHAR
)
RETURNS TABLE (
    clothing_id INT,
    product_id INT,
    name VARCHAR,
    price NUMERIC,
    description TEXT,
    stock INT,
    manufacturer_id INT,
    type VARCHAR,
    typeName VARCHAR,
    material VARCHAR,
    color VARCHAR,
    size VARCHAR,
    gender VARCHAR,
    artistNames TEXT,
    artistIds TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.clothing_id,
        p.product_id,
        p.name,
        p.price,
        p.description,
        p.stock,
        p.manufacturer_id,
        'clothing'::VARCHAR AS type,
        'Одежда'::VARCHAR AS typeName,
        m.material,
        m.color,
        c.size,
        c.gender,
        COALESCE((
            SELECT STRING_AGG(a.name, ', ')
            FROM "ArtistMerch" am
            JOIN "Artist" a ON am.artist_id = a.artist_id
            WHERE am.merch_id = c.merch_id
        ), '') AS artistNames,
        COALESCE((
            SELECT json_agg(am.artist_id)::TEXT
            FROM "ArtistMerch" am
            WHERE am.merch_id = c.merch_id
        ), '[]') AS artistIds
    FROM "Clothing" c
    JOIN "Merch" m ON c.merch_id = m.merch_id
    JOIN "Product" p ON m.product_id = p.product_id
    WHERE 1=1
        AND (p_search_name IS NULL OR p.name ILIKE '%' || p_search_name || '%')
        AND (p_manufacturer_id IS NULL OR p.manufacturer_id = p_manufacturer_id)
        AND (p_artist_id IS NULL OR EXISTS (
            SELECT 1 FROM "ArtistMerch" am
            WHERE am.merch_id = c.merch_id AND am.artist_id = p_artist_id
        ))
        AND (p_in_stock = false OR p.stock > 0)
        AND (p_price_min IS NULL OR p.price >= p_price_min)
        AND (p_price_max IS NULL OR p.price <= p_price_max)
        AND (p_selected_genres IS NULL OR EXISTS (
            SELECT 1 FROM "ProductGenre" pg
            JOIN "Genre" g ON pg.genre_id = g.genre_id
            WHERE pg.product_id = p.product_id AND g.name = ANY(string_to_array(p_selected_genres, ','))
        ));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_filtered_accessories(
    p_search_name VARCHAR,
    p_manufacturer_id INT,
    p_artist_id INT,
    p_in_stock BOOLEAN,
    p_price_min NUMERIC,
    p_price_max NUMERIC,
    p_selected_genres VARCHAR
)
RETURNS TABLE (
    accessory_id INT,
    product_id INT,
    name VARCHAR,
    price NUMERIC,
    description TEXT,
    stock INT,
    manufacturer_id INT,
    type VARCHAR,
    typeName VARCHAR,
    material VARCHAR,
    color VARCHAR,
    accessory_type VARCHAR,
    weight NUMERIC,
    artistNames TEXT,
    artistIds TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.accessory_id,
        p.product_id,
        p.name,
        p.price,
        p.description,
        p.stock,
        p.manufacturer_id,
        'accessory'::VARCHAR AS type,
        'Аксессуар'::VARCHAR AS typeName,
        m.material,
        m.color,
        a.accessory_type,
        a.weight,
        COALESCE((
            SELECT STRING_AGG(a2.name, ', ')
            FROM "ArtistMerch" am
            JOIN "Artist" a2 ON am.artist_id = a2.artist_id
            WHERE am.merch_id = a.merch_id
        ), '') AS artistNames,
        COALESCE((
            SELECT json_agg(am.artist_id)::TEXT
            FROM "ArtistMerch" am
            WHERE am.merch_id = a.merch_id
        ), '[]') AS artistIds
    FROM "Accessory" a
    JOIN "Merch" m ON a.merch_id = m.merch_id
    JOIN "Product" p ON m.product_id = p.product_id
    WHERE 1=1
        AND (p_search_name IS NULL OR p.name ILIKE '%' || p_search_name || '%')
        AND (p_manufacturer_id IS NULL OR p.manufacturer_id = p_manufacturer_id)
        AND (p_artist_id IS NULL OR EXISTS (
            SELECT 1 FROM "ArtistMerch" am
            WHERE am.merch_id = a.merch_id AND am.artist_id = p_artist_id
        ))
        AND (p_in_stock = false OR p.stock > 0)
        AND (p_price_min IS NULL OR p.price >= p_price_min)
        AND (p_price_max IS NULL OR p.price <= p_price_max)
        AND (p_selected_genres IS NULL OR EXISTS (
            SELECT 1 FROM "ProductGenre" pg
            JOIN "Genre" g ON pg.genre_id = g.genre_id
            WHERE pg.product_id = p.product_id AND g.name = ANY(string_to_array(p_selected_genres, ','))
        ));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_product_names() RETURNS TABLE (name VARCHAR) AS $$
BEGIN RETURN QUERY SELECT p.name FROM "Product" p; END;
$$ LANGUAGE plpgsql;