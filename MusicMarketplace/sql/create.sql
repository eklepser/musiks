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

CREATE TABLE IF NOT EXISTS "ChangeLog" (
    log_id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INT,
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);