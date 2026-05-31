CREATE TABLE IF NOT EXISTS "User" (
    user_id SERIAL PRIMARY KEY,
    login VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    full_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Manufacturer" (
    manufacturer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    contact_info VARCHAR(200),
    country VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS "Genre" (
    genre_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS "Product" (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    description TEXT,
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    manufacturer_id INT NOT NULL,
    FOREIGN KEY (manufacturer_id) REFERENCES "Manufacturer"(manufacturer_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ProductGenre" (
    product_id INT NOT NULL,
    genre_id INT NOT NULL,
    PRIMARY KEY (product_id, genre_id),
    FOREIGN KEY (product_id) REFERENCES "Product"(product_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES "Genre"(genre_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Merch" (
    merch_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL UNIQUE,
    material VARCHAR(50),
    color VARCHAR(30),
    FOREIGN KEY (product_id) REFERENCES "Product"(product_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Concert" (
    concert_id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    venue VARCHAR(100) NOT NULL,
    datetime TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "Ticket" (
    ticket_id SERIAL PRIMARY KEY,
    concert_id INT NOT NULL,
    product_id INT NOT NULL UNIQUE,
    price_category VARCHAR(50),
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    FOREIGN KEY (concert_id) REFERENCES "Concert"(concert_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES "Product"(product_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Clothing" (
    clothing_id SERIAL PRIMARY KEY,
    merch_id INT NOT NULL UNIQUE,
    size VARCHAR(10) CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'unisex')),
    FOREIGN KEY (merch_id) REFERENCES "Merch"(merch_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Accessory" (
    accessory_id SERIAL PRIMARY KEY,
    merch_id INT NOT NULL UNIQUE,
    accessory_type VARCHAR(50),
    weight DECIMAL(6,2) CHECK (weight >= 0),
    FOREIGN KEY (merch_id) REFERENCES "Merch"(merch_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Artist" (
    artist_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(50),
    debut_year INT CHECK (debut_year > 1900),
    language VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS "ArtistConcert" (
    artist_id INT NOT NULL,
    concert_id INT NOT NULL,
    PRIMARY KEY (artist_id, concert_id),
    FOREIGN KEY (artist_id) REFERENCES "Artist"(artist_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (concert_id) REFERENCES "Concert"(concert_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ArtistMerch" (
    artist_id INT NOT NULL,
    merch_id INT NOT NULL,
    PRIMARY KEY (artist_id, merch_id),
    FOREIGN KEY (artist_id) REFERENCES "Artist"(artist_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (merch_id) REFERENCES "Merch"(merch_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Order" (
    order_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "OrderItem" (
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES "Order"(order_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES "Product"(product_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Cart" (
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    added_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES "Product"(product_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Wishlist" (
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    added_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES "Product"(product_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Review" (
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    review_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES "Product"(product_id) ON DELETE CASCADE ON UPDATE CASCADE
);

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

CREATE OR REPLACE FUNCTION get_filtered_tickets(
    p_search_name VARCHAR, p_manufacturer_id INT, p_artist_id INT, p_in_stock BOOLEAN,
    p_price_min NUMERIC, p_price_max NUMERIC, p_selected_genres VARCHAR
)
RETURNS TABLE (
    ticket_id INT, product_id INT, name VARCHAR, price NUMERIC, description TEXT, stock INT,
    manufacturer_id INT, type VARCHAR, typeName VARCHAR, concert_id INT, concert_title VARCHAR,
    price_category VARCHAR, artistNames TEXT, artistIds TEXT,
    genre_names TEXT
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
        ), '[]') AS artistIds,
        COALESCE((
            SELECT STRING_AGG(g.name, ', ')
            FROM "ProductGenre" pg
            JOIN "Genre" g ON pg.genre_id = g.genre_id
            WHERE pg.product_id = p.product_id
        ), '') AS genre_names
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
        FOREACH artist_id IN ARRAY v_artist_ids LOOP
            INSERT INTO "ArtistMerch" (artist_id, merch_id) VALUES (artist_id, v_merch_id);
        END LOOP;
    END IF;
    IF p_genre_ids_json IS NOT NULL AND p_genre_ids_json != '' AND p_genre_ids_json != '[]' THEN
        v_genre_ids := ARRAY(SELECT json_array_elements_text(p_genre_ids_json::json)::INT);
        FOREACH genre_id IN ARRAY v_genre_ids LOOP
            INSERT INTO "ProductGenre" (product_id, genre_id) VALUES (v_product_id, genre_id);
        END LOOP;
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
        FOREACH artist_id IN ARRAY v_artist_ids LOOP
            INSERT INTO "ArtistMerch" (artist_id, merch_id) VALUES (artist_id, v_merch_id);
        END LOOP;
    END IF;
    IF p_genre_ids_json IS NOT NULL AND p_genre_ids_json != '' AND p_genre_ids_json != '[]' THEN
        v_genre_ids := ARRAY(SELECT json_array_elements_text(p_genre_ids_json::json)::INT);
        FOREACH genre_id IN ARRAY v_genre_ids LOOP
            INSERT INTO "ProductGenre" (product_id, genre_id) VALUES (v_product_id, genre_id);
        END LOOP;
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
        FOREACH artist_id IN ARRAY v_artist_ids LOOP
            INSERT INTO "ArtistMerch" (artist_id, merch_id) VALUES (artist_id, v_merch_id);
        END LOOP;
    END IF;
    IF p_genre_ids_json IS NOT NULL AND p_genre_ids_json != '' AND p_genre_ids_json != '[]' THEN
        v_genre_ids := ARRAY(SELECT json_array_elements_text(p_genre_ids_json::json)::INT);
        FOREACH genre_id IN ARRAY v_genre_ids LOOP
            INSERT INTO "ProductGenre" (product_id, genre_id) VALUES (v_product_id, genre_id);
        END LOOP;
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
        FOREACH artist_id IN ARRAY v_artist_ids LOOP
            INSERT INTO "ArtistMerch" (artist_id, merch_id) VALUES (artist_id, v_merch_id);
        END LOOP;
    END IF;
    IF p_genre_ids_json IS NOT NULL AND p_genre_ids_json != '' AND p_genre_ids_json != '[]' THEN
        v_genre_ids := ARRAY(SELECT json_array_elements_text(p_genre_ids_json::json)::INT);
        FOREACH genre_id IN ARRAY v_genre_ids LOOP
            INSERT INTO "ProductGenre" (product_id, genre_id) VALUES (v_product_id, genre_id);
        END LOOP;
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
    query_text := '
        SELECT a.artist_id, a.name, a.country, a.debut_year, a.language
        FROM "Artist" a
        WHERE 1=1
            AND ($1 IS NULL OR lower(a.name) LIKE lower($1))
            AND ($2 IS NULL OR a.country IS NOT NULL AND lower(a.country) = lower($2))
            AND ($3 IS NULL OR
                ($3 = ''Instrumental'' AND a.language IS NULL) OR
                ($3 != ''Instrumental'' AND a.language IS NOT NULL AND lower(a.language) = lower($3))
            )
    ';
    IF p_sort_by = 'name_desc' THEN
        query_text := query_text || ' ORDER BY a.name DESC';
    ELSE
        query_text := query_text || ' ORDER BY a.name ASC';
    END IF;

    RETURN QUERY EXECUTE query_text USING
        CASE WHEN p_search_name IS NOT NULL THEN '%' || p_search_name || '%' ELSE NULL END,
        p_search_country,
        p_search_language;
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
    query_text := '
        SELECT c.product_id, p.name, p.price, c.quantity, c.added_date
        FROM "Cart" c
        JOIN "Product" p ON c.product_id = p.product_id
        WHERE c.user_id = $1
            AND ($2 IS NULL OR lower(p.name) LIKE lower($2))
    ';
    IF p_sort_by = 'price_asc' THEN
        query_text := query_text || ' ORDER BY p.price ASC';
    ELSIF p_sort_by = 'price_desc' THEN
        query_text := query_text || ' ORDER BY p.price DESC';
    ELSIF p_sort_by = 'date_asc' THEN
        query_text := query_text || ' ORDER BY c.added_date ASC';
    ELSE
        query_text := query_text || ' ORDER BY c.added_date DESC';
    END IF;

    RETURN QUERY EXECUTE query_text USING p_user_id,
        CASE WHEN p_search_name IS NOT NULL THEN '%' || p_search_name || '%' ELSE NULL END;
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
    artistIds TEXT,
    genre_names TEXT
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
        ), '[]') AS artistIds,
        COALESCE((
            SELECT STRING_AGG(g.name, ', ')
            FROM "ProductGenre" pg
            JOIN "Genre" g ON pg.genre_id = g.genre_id
            WHERE pg.product_id = p.product_id
        ), '') AS genre_names
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
    artistIds TEXT,
    genre_names TEXT
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
        ), '[]') AS artistIds,
        COALESCE((
            SELECT STRING_AGG(g.name, ', ')
            FROM "ProductGenre" pg
            JOIN "Genre" g ON pg.genre_id = g.genre_id
            WHERE pg.product_id = p.product_id
        ), '') AS genre_names
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
    query_text := '
        SELECT c.concert_id, c.title, c.venue, c.datetime,
            COALESCE((SELECT STRING_AGG(a.name, '', '') FROM "ArtistConcert" ac JOIN "Artist" a ON ac.artist_id = a.artist_id WHERE ac.concert_id = c.concert_id), ''''),
            COALESCE((SELECT ARRAY_AGG(ac.artist_id) FROM "ArtistConcert" ac WHERE ac.concert_id = c.concert_id), ARRAY[]::INT[])
        FROM "Concert" c
        WHERE 1=1
            AND ($1 IS NULL OR lower(c.title) LIKE lower($1))
            AND ($2 IS NULL OR lower(c.venue) LIKE lower($2))
            AND ($3 IS NULL OR
                ($3 = ''upcoming'' AND c.datetime >= $4) OR
                ($3 = ''past'' AND c.datetime < $4))
            AND ($5 IS NULL OR EXISTS (SELECT 1 FROM "ArtistConcert" ac WHERE ac.concert_id = c.concert_id AND ac.artist_id = $5))
    ';
    IF p_sort_by = 'date_desc' THEN
        query_text := query_text || ' ORDER BY c.datetime DESC';
    ELSE
        query_text := query_text || ' ORDER BY c.datetime ASC';
    END IF;

    RETURN QUERY EXECUTE query_text USING
        CASE WHEN p_search_title IS NOT NULL THEN '%' || p_search_title || '%' ELSE NULL END,
        CASE WHEN p_search_venue IS NOT NULL THEN '%' || p_search_venue || '%' ELSE NULL END,
        p_status,
        now_time,
        p_artist_id;
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
    query_text := '
        SELECT g.genre_id, g.name, g.description
        FROM "Genre" g
        WHERE ($1 IS NULL OR lower(g.name) LIKE lower($1))
    ';
    IF p_sort_by = 'name_desc' THEN
        query_text := query_text || ' ORDER BY g.name DESC';
    ELSE
        query_text := query_text || ' ORDER BY g.name ASC';
    END IF;

    RETURN QUERY EXECUTE query_text USING
        CASE WHEN p_search_name IS NOT NULL THEN '%' || p_search_name || '%' ELSE NULL END;
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
    query_text := '
        SELECT m.manufacturer_id, m.name, m.contact_info, m.country
        FROM "Manufacturer" m
        WHERE 1=1
            AND ($1 IS NULL OR lower(m.name) LIKE lower($1))
            AND ($2 IS NULL OR m.country IS NOT NULL AND lower(m.country) LIKE lower($2))
    ';
    IF p_sort_by = 'name_desc' THEN
        query_text := query_text || ' ORDER BY m.name DESC';
    ELSE
        query_text := query_text || ' ORDER BY m.name ASC';
    END IF;

    RETURN QUERY EXECUTE query_text USING
        CASE WHEN p_search_name IS NOT NULL THEN '%' || p_search_name || '%' ELSE NULL END,
        CASE WHEN p_search_country IS NOT NULL THEN '%' || p_search_country || '%' ELSE NULL END;
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
    query_text := '
        SELECT r.product_id, p.name, r.rating, r.review_text, r.review_date
        FROM "Review" r
        JOIN "Product" p ON r.product_id = p.product_id
        WHERE r.user_id = $1
            AND ($2 IS NULL OR lower(p.name) LIKE lower($2))
            AND ($3 IS NULL OR r.rating = $3)
    ';
    IF p_sort_by = 'rating_asc' THEN
        query_text := query_text || ' ORDER BY r.rating ASC';
    ELSIF p_sort_by = 'rating_desc' THEN
        query_text := query_text || ' ORDER BY r.rating DESC';
    ELSIF p_sort_by = 'date_asc' THEN
        query_text := query_text || ' ORDER BY r.review_date ASC';
    ELSE
        query_text := query_text || ' ORDER BY r.review_date DESC';
    END IF;

    RETURN QUERY EXECUTE query_text USING p_user_id,
        CASE WHEN p_search_name IS NOT NULL THEN '%' || p_search_name || '%' ELSE NULL END,
        p_rating;
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
    query_text := '
        SELECT w.product_id, p.name, p.price, w.added_date
        FROM "Wishlist" w
        JOIN "Product" p ON w.product_id = p.product_id
        WHERE w.user_id = $1
            AND ($2 IS NULL OR lower(p.name) LIKE lower($2))
    ';
    IF p_sort_by = 'price_asc' THEN
        query_text := query_text || ' ORDER BY p.price ASC';
    ELSIF p_sort_by = 'price_desc' THEN
        query_text := query_text || ' ORDER BY p.price DESC';
    ELSIF p_sort_by = 'date_asc' THEN
        query_text := query_text || ' ORDER BY w.added_date ASC';
    ELSE
        query_text := query_text || ' ORDER BY w.added_date DESC';
    END IF;

    RETURN QUERY EXECUTE query_text USING p_user_id,
        CASE WHEN p_search_name IS NOT NULL THEN '%' || p_search_name || '%' ELSE NULL END;
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

CREATE OR REPLACE FUNCTION get_product_names() RETURNS TABLE (name VARCHAR) AS $$
BEGIN RETURN QUERY SELECT p.name FROM "Product" p; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_filtered_orders_with_items(
    p_user_id INT,
    p_status VARCHAR,
    p_date_from DATE,
    p_date_to DATE,
    p_sort_by VARCHAR
)
RETURNS TABLE (
    order_id INT, user_id INT, user_name VARCHAR, user_login VARCHAR,
    order_date TIMESTAMP, status VARCHAR, total_amount DECIMAL, items_json TEXT
) AS $$
DECLARE order_record RECORD; items_json TEXT; items_array JSONB; query_text TEXT;
BEGIN
    query_text := '
        SELECT o.order_id, o.user_id, u.full_name, u.login, o.order_date, o.status, o.total_amount
        FROM "Order" o
        JOIN "User" u ON o.user_id = u.user_id
        WHERE o.user_id = $1
            AND ($2 IS NULL OR o.status = $2)
            AND ($3 IS NULL OR o.order_date >= $3)
            AND ($4 IS NULL OR o.order_date < $4 + INTERVAL ''1 day'')
    ';
    IF p_sort_by = 'date_asc' THEN
        query_text := query_text || ' ORDER BY o.order_date ASC';
    ELSIF p_sort_by = 'total_desc' THEN
        query_text := query_text || ' ORDER BY o.total_amount DESC';
    ELSIF p_sort_by = 'total_asc' THEN
        query_text := query_text || ' ORDER BY o.total_amount ASC';
    ELSE
        query_text := query_text || ' ORDER BY o.order_date DESC';
    END IF;

    FOR order_record IN EXECUTE query_text USING p_user_id, p_status, p_date_from, p_date_to LOOP
        SELECT jsonb_agg(jsonb_build_object('product_id', oi.product_id, 'product_name', p.name, 'quantity', oi.quantity, 'unit_price', oi.unit_price, 'total_price', oi.quantity * oi.unit_price))
        INTO items_array
        FROM "OrderItem" oi
        JOIN "Product" p ON oi.product_id = p.product_id
        WHERE oi.order_id = order_record.order_id;

        items_json := COALESCE(items_array::TEXT, '[]');
        RETURN QUERY SELECT order_record.order_id, order_record.user_id, order_record.full_name, order_record.login, order_record.order_date, order_record.status, order_record.total_amount, items_json;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_filtered_users(p_search VARCHAR, p_sort_by VARCHAR)
RETURNS TABLE (
    user_id INT, login VARCHAR, email VARCHAR, registration_date DATE, full_name VARCHAR
) AS $$
DECLARE query_text TEXT;
BEGIN
    query_text := '
        SELECT u.user_id, u.login, u.email, u.registration_date, u.full_name
        FROM "User" u
        WHERE ($1 IS NULL OR lower(u.login) LIKE lower($1) OR lower(u.full_name) LIKE lower($1))
    ';
    IF p_sort_by = 'name_asc' THEN
        query_text := query_text || ' ORDER BY u.full_name ASC';
    ELSIF p_sort_by = 'name_desc' THEN
        query_text := query_text || ' ORDER BY u.full_name DESC';
    ELSIF p_sort_by = 'date_asc' THEN
        query_text := query_text || ' ORDER BY u.registration_date ASC';
    ELSIF p_sort_by = 'date_desc' THEN
        query_text := query_text || ' ORDER BY u.registration_date DESC';
    ELSE
        query_text := query_text || ' ORDER BY u.user_id DESC';
    END IF;

    RETURN QUERY EXECUTE query_text USING
        CASE WHEN p_search IS NOT NULL THEN '%' || p_search || '%' ELSE NULL END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_clothing(p_id INT) RETURNS BOOLEAN AS $$
DECLARE v_merch_id INT; v_product_id INT;
BEGIN
    SELECT merch_id INTO v_merch_id FROM "Clothing" cl WHERE cl.clothing_id = p_id;
    IF NOT FOUND THEN RETURN FALSE; END IF;
    SELECT product_id INTO v_product_id FROM "Merch" m WHERE m.merch_id = v_merch_id;
    IF EXISTS (SELECT 1 FROM "OrderItem" oi WHERE oi.product_id = v_product_id) THEN
        RAISE EXCEPTION 'Невозможно удалить товар, который есть в заказах';
    END IF;
    DELETE FROM "Clothing" WHERE clothing_id = p_id;
    DELETE FROM "Merch" WHERE merch_id = v_merch_id;
    DELETE FROM "Product" WHERE product_id = v_product_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_accessory(p_id INT) RETURNS BOOLEAN AS $$
DECLARE v_merch_id INT; v_product_id INT;
BEGIN
    SELECT merch_id INTO v_merch_id FROM "Accessory" acc WHERE acc.accessory_id = p_id;
    IF NOT FOUND THEN RETURN FALSE; END IF;
    SELECT product_id INTO v_product_id FROM "Merch" m WHERE m.merch_id = v_merch_id;
    IF EXISTS (SELECT 1 FROM "OrderItem" oi WHERE oi.product_id = v_product_id) THEN
        RAISE EXCEPTION 'Невозможно удалить товар, который есть в заказах';
    END IF;
    DELETE FROM "Accessory" WHERE accessory_id = p_id;
    DELETE FROM "Merch" WHERE merch_id = v_merch_id;
    DELETE FROM "Product" WHERE product_id = v_product_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_ticket(p_id INT) RETURNS BOOLEAN AS $$
DECLARE v_product_id INT;
BEGIN
    SELECT product_id INTO v_product_id FROM "Ticket" t WHERE t.ticket_id = p_id;
    IF NOT FOUND THEN RETURN FALSE; END IF;
    IF EXISTS (SELECT 1 FROM "OrderItem" oi WHERE oi.product_id = v_product_id) THEN
        RAISE EXCEPTION 'Невозможно удалить билет, который есть в заказах';
    END IF;
    DELETE FROM "Ticket" WHERE ticket_id = p_id;
    DELETE FROM "Product" WHERE product_id = v_product_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_product(p_id INT) RETURNS BOOLEAN AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM "OrderItem" oi WHERE oi.product_id = p_id) THEN
        RAISE EXCEPTION 'Невозможно удалить товар, который есть в заказах';
    END IF;
    DELETE FROM "Product" p WHERE p.product_id = p_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_reviews_by_product(p_product_id INT)
RETURNS TABLE (
    product_id INT,
    product_name VARCHAR,
    rating INT,
    review_text TEXT,
    review_date TIMESTAMP,
    user_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.product_id,
        p.name,
        r.rating,
        r.review_text,
        r.review_date,
        u.full_name
    FROM "Review" r
    JOIN "Product" p ON r.product_id = p.product_id
    JOIN "User" u ON r.user_id = u.user_id
    WHERE r.product_id = p_product_id
    ORDER BY r.review_date DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_product_stock_on_order()
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

CREATE TRIGGER trg_OrderItem_insert_before
    BEFORE INSERT ON "OrderItem"
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock_on_order();

INSERT INTO "Genre" (genre_id, name, description) VALUES
(1, 'Rock', 'Гитары, ударные, энергичный вокал'),
(2, 'Pop', 'Популярная музыка, мелодичные хиты'),
(3, 'Electronic', 'Синтезаторы, биты, электронные звуки'),
(4, 'Jazz', 'Импровизация, сложные гармонии'),
(5, 'Classical', 'Оркестровая музыка, симфонии'),
(6, 'Hip Hop', 'Ритмичная речь, биты, уличная культура'),
(7, 'Rap', 'Рифмованный речитатив, часто социальные темы'),
(8, 'R&B', 'Ритм-энд-блюз, плавный вокал'),
(9, 'Indie Rock', 'Независимая рок-музыка, альтернативное звучание'),
(10, 'Heavy Metal', 'Тяжёлые гитары, агрессивный вокал'),
(11, 'Blues', 'Грустные мотивы, слайд-гитара'),
(12, 'Country', 'Фолк-кантри, акустические инструменты'),
(13, 'Soul', 'Душевная музыка, богатые вокальные гармонии'),
(14, 'Reggae', 'Ямайские ритмы, расслабленный грув');

SELECT setval('"Genre_genre_id_seq"', (SELECT COALESCE(MAX(genre_id), 1) FROM "Genre"));

INSERT INTO "Manufacturer" (manufacturer_id, name, contact_info, country) VALUES
(1, 'Universal Music', 'contact@universal.com', 'USA'),
(2, 'Sony Music', 'info@sonymusic.com', 'Japan'),
(3, 'Warner Records', 'support@warner.com', 'USA'),
(4, 'Merch Factory', 'merch@factory.com', 'China'),
(5, 'Def Jam Recordings', 'defjam@defjam.com', 'USA'),
(6, 'Live Nation Russia', 'tickets@livenation.ru', 'Russia'),
(7, 'SAV Entertainment', 'info@sav.ru', 'Russia'),
(8, 'Pop Farm', 'concert@popfarm.ru', 'Russia'),
(9, 'Melnitsa Booking', 'booking@melnitsa.ru', 'Russia'),
(10, 'NCA', 'booking@nca.ru', 'Russia');

SELECT setval('"Manufacturer_manufacturer_id_seq"', (SELECT COALESCE(MAX(manufacturer_id), 1) FROM "Manufacturer"));

INSERT INTO "User" (user_id, login, email, registration_date, full_name, password_hash) VALUES
(1, 'ivanov', 'ivanov@mail.ru', '2024-01-15', 'Иван Иванов', 'hash1'),
(2, 'petrova', 'petrova@mail.ru', '2024-02-20', 'Петрова Анна', 'hash2'),
(3, 'smith', 'smith@example.com', '2024-03-10', 'John Smith', 'hash3'),
(4, 'dj_rus', 'ruslan@dj.ru', '2024-04-05', 'Руслан Морозов', 'hash4');

SELECT setval('"User_user_id_seq"', (SELECT COALESCE(MAX(user_id), 1) FROM "User"));

INSERT INTO "Artist" (artist_id, name, country, debut_year, language) VALUES
(1, 'Kanye West', 'USA', 2004, 'English'),
(2, 'Dua Lipa', 'UK', 2015, 'English'),
(3, 'Hans Zimmer', 'Germany', 1980, NULL),
(4, 'Metallica', 'USA', 1981, 'English'),
(5, 'The Weeknd', 'Canada', 2010, 'English'),
(6, 'Kendrick Lamar', 'USA', 2011, 'English'),
(7, 'Taylor Swift', 'USA', 2006, 'English'),
(8, 'Billie Eilish', 'USA', 2015, 'English'),
(9, 'Ed Sheeran', 'UK', 2011, 'English'),
(10, 'Eminem', 'USA', 1996, 'English'),
(11, 'Depeche Mode', 'UK', 1980, 'English'),
(12, 'Gorillaz', 'UK', 1998, 'English'),
(13, 'Drake', 'Canada', 2009, 'English'),
(14, 'Coldplay', 'UK', 1998, 'English'),
(15, 'Deftones', 'USA', 1988, 'English'),
(16, 'David Bowie', 'UK', 1967, 'English'),
(17, 'The Rolling Stones', 'UK', 1962, 'English'),
(18, 'Pink Floyd', 'UK', 1965, 'English'),
(19, 'Rihanna', 'Barbados', 2005, 'English'),
(20, 'AC/DC', 'Australia', 1973, 'English'),
(21, 'Queen', 'UK', 1970, 'English'),
(22, 'Linkin Park', 'USA', 1996, 'English'),
(23, 'The Beatles', 'UK', 1960, 'English');

SELECT setval('"Artist_artist_id_seq"', (SELECT COALESCE(MAX(artist_id), 1) FROM "Artist"));

INSERT INTO "Concert" (concert_id, title, venue, datetime) VALUES
(1, 'Kanye West – Vultures Tour', 'Luzhniki Stadium, Moscow', '2024-07-25 20:00:00'),
(2, 'Dua Lipa Future Nostalgia', 'VTB Arena, Moscow', '2024-07-20 20:00:00'),
(3, 'Hans Zimmer Live', 'Kremlin Palace, Moscow', '2024-09-10 19:30:00'),
(4, 'Metallica M72 World Tour', 'Spartak Stadium, Moscow', '2024-08-15 19:00:00'),
(5, 'Kendrick Lamar – The Big Steppers', 'Megasport Arena, Moscow', '2024-06-30 20:30:00'),
(6, 'Taylor Swift The Eras Tour', 'Luzhniki Stadium, Moscow', '2025-09-25 19:00:00'),
(7, 'Billie Eilish Happier Than Ever', 'VTB Arena, Moscow', '2025-10-10 20:00:00'),
(8, 'Ed Sheeran Mathematics Tour', 'Olympic Stadium, Moscow', '2025-05-15 19:30:00'),
(9, 'Eminem Revival Tour', 'Spartak Stadium, Moscow', '2025-06-20 20:00:00'),
(10, 'Depeche Mode Memento Mori', 'Luzhniki Stadium, Moscow', '2025-07-01 19:00:00'),
(11, 'Gorillaz World Tour', 'VTB Arena, Moscow', '2025-08-10 20:30:00'),
(12, 'Drake It''s All a Blur', 'Kremlin Palace, Moscow', '2025-09-05 19:00:00'),
(13, 'Coldplay Music of the Spheres', 'Luzhniki Stadium, Moscow', '2026-06-15 20:00:00'),
(14, 'Deftones – Ohms Tour', 'Megasport Arena, Moscow', '2026-08-20 20:00:00'),
(15, 'David Bowie – A Tribute', 'Kremlin Palace, Moscow', '2026-09-10 19:30:00'),
(16, 'The Rolling Stones – Sixty Tour', 'Spartak Stadium, Moscow', '2026-10-05 19:00:00'),
(17, 'Pink Floyd – Dark Side Reunion', 'Luzhniki Stadium, Moscow', '2027-05-20 20:00:00');

SELECT setval('"Concert_concert_id_seq"', (SELECT COALESCE(MAX(concert_id), 1) FROM "Concert"));

INSERT INTO "Product" (product_id, name, price, description, stock, manufacturer_id) VALUES
(1, 'Deftones – Стоячий партер', 6500.00, 'Стоячий партер перед сценой', 500, 6),
(2, 'Deftones – Трибуны', 4500.00, 'Трибуны, хороший обзор', 800, 6),
(3, 'David Bowie – Партер', 8500.00, 'Партерные места', 400, 7),
(4, 'David Bowie – VIP-ложа', 25000.00, 'Отдельная ложа с напитками', 30, 7),
(5, 'The Rolling Stones – Фан-зона', 9500.00, 'Ближайшая к сцене зона', 600, 6),
(6, 'The Rolling Stones – Трибуны', 5500.00, 'Трибуны', 900, 6),
(7, 'Pink Floyd – Танцевальный партер', 11000.00, 'Танцевальный партер', 700, 8),
(8, 'Pink Floyd – Амфитеатр', 7500.00, 'Места в амфитеатре', 500, 8),
(9, 'Coldplay – Партер', 8900.00, 'Партерные места', 600, 8),
(10, 'Футболка Kanye West', 4000.00, 'Черная с надписью "Ye"', 200, 4),
(11, 'Худи Dua Lipa', 6000.00, 'Розовое худи', 100, 4),
(12, 'Футболка Metallica', 4500.00, 'Черная с логотипом', 180, 4),
(13, 'Худи Kendrick Lamar', 5800.00, 'Черное худи с надписью "DAMN"', 120, 4),
(14, 'Футболка Taylor Swift', 4200.00, 'Белая футболка с портретом', 150, 4),
(15, 'Худи Billie Eilish', 6200.00, 'Серая худи с ушами', 100, 4),
(16, 'Футболка Ed Sheeran', 3900.00, 'Розовая футболка', 140, 4),
(17, 'Худи Eminem', 6500.00, 'Черное худи с надписью "Stan"', 110, 4),
(18, 'Футболка Depeche Mode', 4400.00, 'Черная футболка с логотипом', 130, 4),
(19, 'Худи Gorillaz', 6300.00, 'Синее худи с персонажами', 115, 4),
(20, 'Футболка Drake', 4300.00, 'Черная футболка с логотипом OVO', 140, 4),
(21, 'Худи Coldplay', 5500.00, 'Синее худи с символикой', 130, 4),
(22, 'Футболка Deftones', 4100.00, 'Черная футболка с логотипом группы', 170, 4),
(23, 'Худи David Bowie', 6800.00, 'Красное худи с молнией', 90, 4),
(24, 'Футболка The Rolling Stones', 4600.00, 'Белая футболка с языком', 160, 4),
(25, 'Худи Pink Floyd', 7000.00, 'Черное худи с призмой', 100, 4),
(26, 'Футболка Rihanna', 4200.00, 'Белая футболка с надписью "Fenty"', 150, 4),
(27, 'Браслет Metallica', 1500.00, 'Кожаный браслет', 300, 4),
(28, 'Панама Kendrick Lamar', 2500.00, 'Хлопковая панама', 150, 4),
(29, 'Постер Taylor Swift', 1299.00, 'Официальный постер', 500, 4),
(30, 'Брелок Billie Eilish', 899.00, 'Светящийся брелок', 400, 4),
(31, 'Кружка Ed Sheeran', 1499.00, 'Керамическая кружка', 250, 4),
(32, 'Кепка Drake', 3000.00, 'Черная кепка с логотипом OVO', 200, 4),
(33, 'Сумка-шоппер Rihanna', 2800.00, 'Хлопковая сумка с принтом', 220, 4),
(34, 'Браслет The Rolling Stones', 1700.00, 'Серебряный браслет с логотипом', 250, 4),
(35, 'Кепка Pink Floyd', 3200.00, 'Черная кепка с призмой', 180, 4);

SELECT setval('"Product_product_id_seq"', (SELECT COALESCE(MAX(product_id), 1) FROM "Product"));

INSERT INTO "Ticket" (ticket_id, concert_id, product_id, price_category, quantity) VALUES
(1, 14, 1, 'Стоячий партер', 500),
(2, 14, 2, 'Трибуны', 800),
(3, 15, 3, 'Партер', 400),
(4, 15, 4, 'VIP-ложа', 30),
(5, 16, 5, 'Фан-зона', 600),
(6, 16, 6, 'Трибуны', 900),
(7, 17, 7, 'Танцевальный партер', 700),
(8, 17, 8, 'Амфитеатр', 500),
(9, 13, 9, 'Партер', 600);

SELECT setval('"Ticket_ticket_id_seq"', (SELECT COALESCE(MAX(ticket_id), 1) FROM "Ticket"));

INSERT INTO "Merch" (merch_id, product_id, material, color) VALUES
(1, 10, 'Хлопок', 'Черный'),
(2, 11, 'Хлопок', 'Розовый'),
(3, 12, 'Хлопок', 'Черный'),
(4, 13, 'Хлопок', 'Черный'),
(5, 14, 'Хлопок', 'Белый'),
(6, 15, 'Хлопок', 'Серый'),
(7, 16, 'Хлопок', 'Розовый'),
(8, 17, 'Хлопок', 'Черный'),
(9, 18, 'Хлопок', 'Черный'),
(10, 19, 'Хлопок', 'Синий'),
(11, 20, 'Хлопок', 'Черный'),
(12, 21, 'Хлопок', 'Синий'),
(13, 22, 'Хлопок', 'Черный'),
(14, 23, 'Хлопок', 'Красный'),
(15, 24, 'Хлопок', 'Белый'),
(16, 25, 'Хлопок', 'Черный'),
(17, 26, 'Хлопок', 'Белый'),
(18, 27, 'Кожа', 'Коричневый'),
(19, 28, 'Хлопок', 'Бежевый'),
(20, 29, 'Бумага', 'Цветной'),
(21, 30, 'Пластик', 'Черный'),
(22, 31, 'Керамика', 'Белый'),
(23, 32, 'Полиэстер', 'Черный'),
(24, 33, 'Хлопок', 'Бежевый'),
(25, 34, 'Металл', 'Серебряный'),
(26, 35, 'Полиэстер', 'Черный');

SELECT setval('"Merch_merch_id_seq"', (SELECT COALESCE(MAX(merch_id), 1) FROM "Merch"));

INSERT INTO "Clothing" (clothing_id, merch_id, size, gender) VALUES
(1, 1, 'L', 'male'),
(2, 2, 'M', 'female'),
(3, 3, 'XL', 'male'),
(4, 4, 'M', 'unisex'),
(5, 5, 'L', 'female'),
(6, 6, 'S', 'female'),
(7, 7, 'M', 'unisex'),
(8, 8, 'XL', 'male'),
(9, 9, 'L', 'female'),
(10, 10, 'M', 'unisex'),
(11, 11, 'S', 'female'),
(12, 12, 'XL', 'unisex'),
(13, 13, 'L', 'male'),
(14, 14, 'M', 'unisex'),
(15, 15, 'XL', 'male'),
(16, 16, 'L', 'unisex'),
(17, 17, 'M', 'female');

SELECT setval('"Clothing_clothing_id_seq"', (SELECT COALESCE(MAX(clothing_id), 1) FROM "Clothing"));

INSERT INTO "Accessory" (accessory_id, merch_id, accessory_type, weight) VALUES
(1, 18, 'Браслет', 30.0),
(2, 19, 'Панама', 80.0),
(3, 20, 'Постер', 50.0),
(4, 21, 'Брелок', 15.0),
(5, 22, 'Кружка', 320.0),
(6, 23, 'Кепка', 120.0),
(7, 24, 'Сумка', 180.0),
(8, 25, 'Браслет', 25.0),
(9, 26, 'Кепка', 130.0);

SELECT setval('"Accessory_accessory_id_seq"', (SELECT COALESCE(MAX(accessory_id), 1) FROM "Accessory"));

INSERT INTO "ProductGenre" (product_id, genre_id) VALUES
(1, 10), (2, 10),
(3, 1), (3, 9), (4, 1), (4, 9),
(5, 1), (6, 1),
(7, 1), (7, 5), (8, 1), (8, 5),
(9, 1), (9, 2),
(10, 6), (10, 7),
(11, 2),
(12, 10),
(13, 6), (13, 7),
(14, 2),
(15, 2),
(16, 2),
(17, 6), (17, 7),
(18, 3), (18, 8),
(19, 3), (19, 9),
(20, 6), (20, 7),
(21, 1), (21, 9),
(22, 10),
(23, 1), (23, 9),
(24, 1),
(25, 1), (25, 5),
(26, 2), (26, 8),
(27, 10),
(28, 6), (28, 7),
(29, 2),
(30, 2),
(31, 2),
(32, 6), (32, 7),
(33, 2), (33, 8),
(34, 1),
(35, 1), (35, 5);

INSERT INTO "ArtistConcert" (artist_id, concert_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (6, 5), (7, 6), (8, 7),
(9, 8), (10, 9), (11, 10), (12, 11), (13, 12), (14, 13),
(15, 14), (16, 15), (17, 16), (18, 17);

INSERT INTO "ArtistMerch" (artist_id, merch_id) VALUES
(1, 1), (2, 2), (4, 3), (6, 4), (7, 5), (8, 6), (9, 7),
(10, 8), (11, 9), (12, 10), (13, 11), (14, 12), (15, 13),
(16, 14), (17, 15), (18, 16), (19, 17), (4, 18), (6, 19),
(7, 20), (8, 21), (9, 22), (13, 23), (19, 24), (17, 25),
(18, 26);

INSERT INTO "Cart" (user_id, product_id, quantity, added_date) VALUES
(4, 12, 1, NOW()),
(4, 27, 2, NOW());

INSERT INTO "Wishlist" (user_id, product_id, added_date) VALUES
(2, 13, NOW()),
(1, 28, NOW());

INSERT INTO "Review" (user_id, product_id, rating, review_text, review_date) VALUES
(1, 10, 5, 'Отличная футболка, качественный хлопок!', '2025-05-01 14:00:00'),
(2, 1, 4, 'Билеты нормальные, концерт будет огонь', '2025-05-12 19:30:00'),
(3, 13, 5, 'Худи Kendrick Lamar – просто бомба', '2025-05-14 22:15:00');
