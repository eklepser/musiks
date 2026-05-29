TRUNCATE TABLE "ArtistMerch" CASCADE;
TRUNCATE TABLE "ArtistConcert" CASCADE;
TRUNCATE TABLE "ProductGenre" CASCADE;
TRUNCATE TABLE "OrderItem" CASCADE;
TRUNCATE TABLE "Review" CASCADE;
TRUNCATE TABLE "Cart" CASCADE;
TRUNCATE TABLE "Wishlist" CASCADE;
TRUNCATE TABLE "Accessory" CASCADE;
TRUNCATE TABLE "Clothing" CASCADE;
TRUNCATE TABLE "Merch" CASCADE;
TRUNCATE TABLE "Ticket" CASCADE;
TRUNCATE TABLE "Order" CASCADE;
TRUNCATE TABLE "Concert" CASCADE;
TRUNCATE TABLE "Artist" CASCADE;
TRUNCATE TABLE "Product" CASCADE;
TRUNCATE TABLE "Genre" CASCADE;
TRUNCATE TABLE "Manufacturer" CASCADE;
TRUNCATE TABLE "User" CASCADE;

ALTER SEQUENCE "Genre_genre_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Manufacturer_manufacturer_id_seq" RESTART WITH 1;
ALTER SEQUENCE "User_user_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Artist_artist_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Concert_concert_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Product_product_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Ticket_ticket_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Merch_merch_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Clothing_clothing_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Accessory_accessory_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Order_order_id_seq" RESTART WITH 1;

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

INSERT INTO "Manufacturer" (manufacturer_id, name, contact_info, country) VALUES
(1, 'Universal Music', 'contact@universal.com', 'USA'),
(2, 'Sony Music', 'info@sonymusic.com', 'Japan'),
(3, 'Warner Records', 'support@warner.com', 'USA'),
(4, 'Merch Factory', 'merch@factory.com', 'China'),
(5, 'Def Jam Recordings', 'defjam@defjam.com', 'USA'),
(6, 'Live Nation Russia', 'tickets@livenation.ru', 'Russia'),
(7, 'SAV Entertainment', 'info@sav.ru', 'Russia'),
(8, 'Pop Farm', 'concert@popfarm.ru', 'Russia'),
(9, 'Мельница', 'booking@millennium.ru', 'Russia'),
(10, 'NCA', 'booking@nca.ru', 'Russia');

ALTER SEQUENCE "Manufacturer_manufacturer_id_seq" RESTART WITH 11;

INSERT INTO "User" (user_id, login, email, registration_date, full_name, password_hash) VALUES
(1, 'ivanov', 'ivanov@mail.ru', '2024-01-15', 'Иван Иванов', 'hash1'),
(2, 'petrova', 'petrova@mail.ru', '2024-02-20', 'Петрова Анна', 'hash2'),
(3, 'smith', 'smith@example.com', '2024-03-10', 'John Smith', 'hash3'),
(4, 'dj_rus', 'ruslan@dj.ru', '2024-04-05', 'Руслан Морозов', 'hash4');

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
(11, 'Beyoncé', 'USA', 1997, 'English'),
(12, 'Drake', 'Canada', 2009, 'English'),
(13, 'Adele', 'UK', 2008, 'English'),
(14, 'Coldplay', 'UK', 1998, 'English'),
(15, 'Imagine Dragons', 'USA', 2008, 'English'),
(16, 'Rihanna', 'Barbados', 2005, 'English'),
(17, 'AC/DC', 'Australia', 1973, 'English'),
(18, 'Queen', 'UK', 1970, 'English'),
(19, 'Linkin Park', 'USA', 1996, 'English'),
(20, 'The Beatles', 'UK', 1960, 'English');

ALTER SEQUENCE "Artist_artist_id_seq" RESTART WITH 21;

INSERT INTO "Concert" (concert_id, title, venue, datetime) VALUES
(1, 'Kanye West – Vultures Tour', 'Luzhniki Stadium, Moscow', '2024-07-25 20:00:00'),
(2, 'Dua Lipa Future Nostalgia', 'VTB Arena, Moscow', '2024-07-20 20:00:00'),
(3, 'Hans Zimmer Live', 'Kremlin Palace, Moscow', '2024-09-10 19:30:00'),
(4, 'Metallica M72 World Tour', 'Spartak Stadium, Moscow', '2024-08-15 19:00:00'),
(5, 'Kendrick Lamar – The Big Steppers', 'Megasport Arena, Moscow', '2024-06-30 20:30:00'),
(6, 'Taylor Swift The Eras Tour', 'Luzhniki Stadium, Moscow', '2025-09-25 19:00:00'),
(7, 'Billie Eilish Happier Than Ever', 'VTB Arena, Moscow', '2025-10-10 20:00:00'),
(8, 'Ed Sheeran Mathematics Tour', 'Olympic Stadium, Moscow', '2026-05-15 19:30:00'),
(9, 'Eminem Revival Tour', 'Spartak Stadium, Moscow', '2026-06-20 20:00:00'),
(10, 'Beyoncé Renaissance Tour', 'Luzhniki Stadium, Moscow', '2026-07-01 19:00:00'),
(11, 'Drake It''s All a Blur', 'VTB Arena, Moscow', '2026-08-10 20:30:00'),
(12, 'Adele Weekends with Adele', 'Kremlin Palace, Moscow', '2026-09-05 19:00:00'),
(13, 'Coldplay Music of the Spheres', 'Luzhniki Stadium, Moscow', '2027-06-15 20:00:00');

ALTER SEQUENCE "Concert_concert_id_seq" RESTART WITH 14;

INSERT INTO "Product" (product_id, name, price, description, stock, manufacturer_id) VALUES
(1, 'The College Dropout (CD)', 1999.00, 'Дебютный альбом Kanye West', 120, 5),
(2, 'Graduation (Винил)', 3299.00, 'Третий студийный альбом', 80, 5),
(3, 'Future Nostalgia (Винил)', 2999.00, 'Винил Dua Lipa', 50, 3),
(4, 'The Dark Knight OST', 1299.00, 'Саундтрек Ханса Циммера', 200, 2),
(5, 'DAMN. (CD)', 1599.00, 'Альбом Kendrick Lamar', 150, 1),
(15, 'Альбом 1989 (Taylor''s Version) (CD)', 2499.00, 'Перезаписанный альбом Тейлор Свифт', 300, 1),
(16, 'Happier Than Ever (CD)', 1899.00, 'Альбом Билли Айлиш', 120, 3),
(17, '÷ (Divide) (CD)', 2199.00, 'Альбом Эда Ширана', 200, 1),
(18, 'Kanye West – Танцевальный партер', 7500.00, 'Стоячий партер, отличный обзор сцены', 800, 6),
(19, 'Kanye West – VIP-ложа', 20000.00, 'Отдельная ложа с напитками', 50, 6),
(20, 'Dua Lipa – Танцпол', 6000.00, 'Танцевальная зона перед сценой', 200, 7),
(21, 'Dua Lipa – Балкон', 4500.00, 'Балкон с видом на сцену', 150, 7),
(22, 'Hans Zimmer – Партер', 8500.00, 'Партерные места', 300, 8),
(23, 'Hans Zimmer – Амфитеатр', 6500.00, 'Места в амфитеатре', 250, 8),
(24, 'Metallica – Фан-зона', 9000.00, 'Ближайшая к сцене зона', 500, 6),
(25, 'Metallica – Трибуны', 5500.00, 'Трибуны', 800, 6),
(26, 'Kendrick Lamar – Стоячий партер', 5500.00, 'Стоячий партер', 400, 9),
(27, 'Taylor Swift – Танцевальный партер', 9500.00, 'Стоячий партер', 600, 6),
(28, 'Taylor Swift – VIP-пакет', 25000.00, 'VIP-пакет с мерчем', 30, 6),
(29, 'Billie Eilish – Партер', 7000.00, 'Партерные места', 350, 7),
(30, 'Футболка Kanye West', 4000.00, 'Черная с надписью "Ye"', 200, 4),
(31, 'Худи Dua Lipa', 6000.00, 'Розовое худи', 100, 4),
(32, 'Браслет Metallica', 1500.00, 'Кожаный браслет', 300, 4),
(33, 'Панама Kendrick Lamar', 2500.00, 'Хлопковая панама', 150, 4),
(34, 'Постер Taylor Swift', 1299.00, 'Официальный постер', 500, 4),
(35, 'Брелок Billie Eilish', 899.00, 'Светящийся брелок', 400, 4),
(36, 'Кружка Ed Sheeran', 1499.00, 'Керамическая кружка', 250, 4),
(37, 'Футболка Eminem', 4500.00, 'Черная с портретом', 180, 4),
(38, 'Худи Beyoncé', 6500.00, 'Белое худи с надписью "Queen"', 120, 4),
(39, 'Кепка Drake', 3000.00, 'Черная кепка с логотипом OVO', 200, 4),
(40, 'Футболка Adele', 4200.00, 'С изображением альбома "25"', 150, 4),
(41, 'Худи Coldplay', 5500.00, 'Синее худи с символикой', 130, 4),
(42, 'Шорты Imagine Dragons', 3500.00, 'Черные шорты с логотипом', 170, 4),
(43, 'Сумка-шоппер Rihanna', 2800.00, 'Хлопковая сумка с принтом', 220, 4),
(44, 'Футболка Queen', 4700.00, 'Белая футболка с логотипом', 190, 4),
(45, 'Худи Linkin Park', 5900.00, 'Черное худи с надписью "Hybrid Theory"', 110, 4),
(46, 'Кепка The Beatles', 2700.00, 'Синяя кепка с надписью "Abbey Road"', 160, 4),
(47, 'Футболка Bruno Mars', 3900.00, 'Розовая футболка с блестками', 140, 4),
(48, 'Худи Ariana Grande', 6200.00, 'Серая худи с ушами кролика', 100, 4),
(49, 'Футболка Lady Gaga', 4400.00, 'Черная футболка с портретом', 125, 4),
(50, 'Кепка Justin Bieber', 2900.00, 'Белая кепка с принтом', 180, 4);

ALTER SEQUENCE "Product_product_id_seq" RESTART WITH 51;

INSERT INTO "Ticket" (ticket_id, concert_id, product_id, price_category, quantity) VALUES
(1, 1, 18, 'Танцевальный партер', 800),
(2, 1, 19, 'VIP-ложа', 50),
(3, 2, 20, 'Танцпол', 200),
(4, 2, 21, 'Балкон', 150),
(5, 3, 22, 'Партер', 300),
(6, 3, 23, 'Амфитеатр', 250),
(7, 4, 24, 'Фан-зона', 500),
(8, 4, 25, 'Трибуны', 800),
(9, 5, 26, 'Стоячий партер', 400),
(10, 6, 27, 'Танцевальный партер', 600),
(11, 6, 28, 'VIP-пакет', 30),
(12, 7, 29, 'Партер', 350),
(13, 8, 30, 'Партер', 500),
(14, 9, 31, 'Танцпол', 400),
(15, 10, 32, 'Партер', 600),
(16, 11, 33, 'Стоячий партер', 300),
(17, 12, 34, 'Партер', 250),
(18, 13, 35, 'Танцевальный партер', 700);

ALTER SEQUENCE "Ticket_ticket_id_seq" RESTART WITH 19;

INSERT INTO "Merch" (merch_id, product_id, material, color) VALUES
(1, 30, 'Хлопок', 'Черный'),
(2, 31, 'Хлопок', 'Розовый'),
(3, 32, 'Кожа', 'Коричневый'),
(4, 33, 'Хлопок', 'Бежевый'),
(5, 34, 'Бумага', 'Цветной'),
(6, 35, 'Пластик', 'Черный'),
(7, 36, 'Керамика', 'Белый'),
(8, 37, 'Хлопок', 'Черный'),
(9, 38, 'Хлопок', 'Белый'),
(10, 39, 'Полиэстер', 'Черный'),
(11, 40, 'Хлопок', 'Черный'),
(12, 41, 'Хлопок', 'Синий'),
(13, 42, 'Полиэстер', 'Черный'),
(14, 43, 'Хлопок', 'Бежевый'),
(15, 44, 'Хлопок', 'Белый'),
(16, 45, 'Хлопок', 'Черный'),
(17, 46, 'Полиэстер', 'Синий'),
(18, 47, 'Хлопок', 'Розовый'),
(19, 48, 'Хлопок', 'Серый'),
(20, 49, 'Хлопок', 'Черный'),
(21, 50, 'Полиэстер', 'Белый');

ALTER SEQUENCE "Merch_merch_id_seq" RESTART WITH 22;

INSERT INTO "Clothing" (clothing_id, merch_id, size, gender) VALUES
(1, 1, 'L', 'male'),
(2, 2, 'M', 'female'),
(3, 4, 'M', 'unisex'),
(4, 8, 'XL', 'male'),
(5, 9, 'L', 'female'),
(6, 10, 'M', 'unisex'),
(7, 11, 'S', 'female'),
(8, 12, 'XL', 'unisex'),
(9, 13, 'L', 'male'),
(10, 15, 'M', 'unisex'),
(11, 16, 'XL', 'male'),
(12, 17, 'L', 'unisex'),
(13, 18, 'M', 'male'),
(14, 19, 'S', 'female'),
(15, 20, 'L', 'female'),
(16, 21, 'M', 'unisex');

ALTER SEQUENCE "Clothing_clothing_id_seq" RESTART WITH 17;

INSERT INTO "Accessory" (accessory_id, merch_id, accessory_type, weight) VALUES
(1, 3, 'Bracelet', 30.0),
(2, 5, 'Poster', 50.0),
(3, 6, 'Keychain', 15.0),
(4, 14, 'Bag', 120.0);

ALTER SEQUENCE "Accessory_accessory_id_seq" RESTART WITH 5;

INSERT INTO "ProductGenre" (product_id, genre_id) VALUES
(1, 6), (1, 7),
(2, 6), (2, 7),
(3, 2),
(4, 5),
(5, 6), (5, 7),
(15, 2),
(16, 2),
(17, 2),
(18, 6), (18, 7),
(19, 6), (19, 7),
(20, 2),
(21, 2),
(22, 5),
(23, 5),
(24, 1), (24, 10),
(25, 1), (25, 10),
(26, 6), (26, 7),
(27, 2),
(28, 2),
(29, 2),
(30, 6), (30, 7),
(31, 2),
(32, 1), (32, 10),
(33, 6), (33, 7),
(34, 2),
(35, 2),
(36, 2),
(37, 6), (37, 7),
(38, 8), (38, 13),
(39, 6), (39, 7),
(40, 2), (40, 13),
(41, 1), (41, 9),
(42, 1), (42, 9),
(43, 2), (43, 8),
(44, 1), (44, 10),
(45, 1), (45, 9),
(46, 1), (46, 2),
(47, 2), (47, 8),
(48, 2), (48, 8),
(49, 2), (49, 3),
(50, 2);

INSERT INTO "ArtistConcert" (artist_id, concert_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (6, 5), (7, 6), (8, 7),
(9, 8), (10, 9), (11, 10), (12, 11), (13, 12), (14, 13);

INSERT INTO "ArtistMerch" (artist_id, merch_id) VALUES
(1, 1), (2, 2), (4, 3), (6, 4), (7, 5), (8, 6), (9, 7),
(10, 8), (11, 9), (12, 10), (13, 11), (14, 12), (15, 13), (16, 14),
(18, 15), (19, 16), (20, 17), (5, 18), (17, 19), (19, 20), (7, 21);

INSERT INTO "Cart" (user_id, product_id, quantity, added_date) VALUES
(4, 33, 1, NOW()), 
(4, 4, 1, NOW());

INSERT INTO "Wishlist" (user_id, product_id, added_date) VALUES
(2, 2, NOW()), 
(1, 32, NOW());

INSERT INTO "Review" (user_id, product_id, rating, review_text, review_date) VALUES
(1, 1, 5, 'Классика, обязателен к прослушиванию!', '2025-05-01 14:00:00'),
(2, 18, 4, 'Концерт огонь, но билеты дороговаты', '2025-05-12 19:30:00'),
(3, 5, 5, 'Лучший рэп-альбом десятилетия', '2025-05-14 22:15:00');

SELECT setval('"Genre_genre_id_seq"', (SELECT COALESCE(MAX(genre_id), 1) FROM "Genre"));
SELECT setval('"Manufacturer_manufacturer_id_seq"', (SELECT COALESCE(MAX(manufacturer_id), 1) FROM "Manufacturer"));
SELECT setval('"User_user_id_seq"', (SELECT COALESCE(MAX(user_id), 1) FROM "User"));
SELECT setval('"Artist_artist_id_seq"', (SELECT COALESCE(MAX(artist_id), 1) FROM "Artist"));
SELECT setval('"Concert_concert_id_seq"', (SELECT COALESCE(MAX(concert_id), 1) FROM "Concert"));
SELECT setval('"Product_product_id_seq"', (SELECT COALESCE(MAX(product_id), 1) FROM "Product"));
SELECT setval('"Ticket_ticket_id_seq"', (SELECT COALESCE(MAX(ticket_id), 1) FROM "Ticket"));
SELECT setval('"Merch_merch_id_seq"', (SELECT COALESCE(MAX(merch_id), 1) FROM "Merch"));
SELECT setval('"Clothing_clothing_id_seq"', (SELECT COALESCE(MAX(clothing_id), 1) FROM "Clothing"));
SELECT setval('"Accessory_accessory_id_seq"', (SELECT COALESCE(MAX(accessory_id), 1) FROM "Accessory"));
SELECT setval('"Order_order_id_seq"', (SELECT COALESCE(MAX(order_id), 1) FROM "Order"));