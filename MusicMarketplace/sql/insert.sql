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
(9, 'Melnitsa Booking', 'booking@melnitsa.ru', 'Russia'),
(10, 'NCA', 'booking@nca.ru', 'Russia');

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

INSERT INTO "Concert" (concert_id, title, venue, datetime) VALUES
(1, 'Kanye West – Vultures Tour', 'Luzhniki Stadium, Moscow', '2026-07-25 20:00:00'),
(2, 'Dua Lipa Future Nostalgia', 'VTB Arena, Moscow', '2026-07-20 20:00:00'),
(3, 'Hans Zimmer Live', 'Kremlin Palace, Moscow', '2026-09-10 19:30:00'),
(4, 'Metallica M72 World Tour', 'Spartak Stadium, Moscow', '2026-08-15 19:00:00'),
(5, 'Kendrick Lamar – The Big Steppers', 'Megasport Arena, Moscow', '2026-06-30 20:30:00'),
(6, 'Taylor Swift The Eras Tour', 'Luzhniki Stadium, Moscow', '2027-09-25 19:00:00'),
(7, 'Billie Eilish Happier Than Ever', 'VTB Arena, Moscow', '2027-10-10 20:00:00'),
(8, 'Ed Sheeran Mathematics Tour', 'Olympic Stadium, Moscow', '2027-05-15 19:30:00'),
(9, 'Eminem Revival Tour', 'Spartak Stadium, Moscow', '2027-06-20 20:00:00'),
(10, 'Depeche Mode Memento Mori', 'Luzhniki Stadium, Moscow', '2027-07-01 19:00:00'),
(11, 'Gorillaz World Tour', 'VTB Arena, Moscow', '2027-08-10 20:30:00'),
(12, 'Drake It''s All a Blur', 'Kremlin Palace, Moscow', '2027-09-05 19:00:00'),
(13, 'Coldplay Music of the Spheres', 'Luzhniki Stadium, Moscow', '2027-06-15 20:00:00'),
(14, 'Deftones – Ohms Tour', 'Megasport Arena, Moscow', '2027-08-20 20:00:00'),
(15, 'David Bowie – A Tribute', 'Kremlin Palace, Moscow', '2027-09-10 19:30:00'),
(16, 'The Rolling Stones – Sixty Tour', 'Spartak Stadium, Moscow', '2027-10-05 19:00:00'),
(17, 'Pink Floyd – Dark Side Reunion', 'Luzhniki Stadium, Moscow', '2027-05-20 20:00:00');

INSERT INTO "Product" (product_id, name, price, description, stock, manufacturer_id) VALUES
(1, 'Deftones – Стоячий партер', 6500.00, 'Билет на концерт Deftones. Стоячий партер перед сценой. Включено: фан-зона, возможность попасть в VIP-ложу.', 500, 6),
(2, 'Deftones – Трибуны', 4500.00, 'Билет на концерт Deftones. Трибуны, отличный обзор сцены. Включено: место для сидения.', 800, 6),
(3, 'David Bowie – Партер', 8500.00, 'Билет на концерт David Bowie. Партерные места, рядом со сценой. Включено: приветственный напиток.', 400, 7),
(4, 'David Bowie – VIP-ложа', 25000.00, 'Билет на концерт David Bowie. VIP-ложа с отдельным входом, шампанское и закуски.', 30, 7),
(5, 'The Rolling Stones – Фан-зона', 9500.00, 'Билет на концерт The Rolling Stones. Фан-зона – самые близкие места к сцене.', 600, 6),
(6, 'The Rolling Stones – Трибуны', 5500.00, 'Билет на концерт The Rolling Stones. Трибуны, хороший обзор.', 900, 6),
(7, 'Pink Floyd – Танцевальный партер', 11000.00, 'Билет на концерт Pink Floyd. Танцевальный партер – можно двигаться и танцевать.', 700, 8),
(8, 'Pink Floyd – Амфитеатр', 7500.00, 'Билет на концерт Pink Floyd. Амфитеатр – места с подъёмом, отличный звук.', 500, 8),
(9, 'Coldplay – Партер', 8900.00, 'Билет на концерт Coldplay. Партерные места, удобный доступ к барам.', 600, 8),
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