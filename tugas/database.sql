-- ============================================================
--  DIMCUM A'SAM — Database Setup
--  Jalankan file ini di phpMyAdmin atau MySQL CLI
--  mysql -u root -p < database.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS dimcum_asam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dimcum_asam;

-- ============================================================
--  TABEL USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,   -- disimpan sebagai hash SHA-256
    role       ENUM('admin','user') NOT NULL DEFAULT 'user',
    joined     DATE NOT NULL DEFAULT (CURDATE()),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
--  TABEL MENU
-- ============================================================
CREATE TABLE IF NOT EXISTS menu (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    category   VARCHAR(50)  NOT NULL,
    price      INT          NOT NULL,
    description TEXT,
    emoji      VARCHAR(10)  DEFAULT '🥟',
    status     ENUM('active','inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
--  TABEL ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    customer   VARCHAR(100) NOT NULL,
    total      INT          NOT NULL DEFAULT 0,
    status     ENUM('pending','done','cancelled') NOT NULL DEFAULT 'pending',
    order_date DATE         NOT NULL DEFAULT (CURDATE()),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
--  TABEL ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    order_id   INT          NOT NULL,
    menu_name  VARCHAR(150) NOT NULL,
    qty        INT          NOT NULL DEFAULT 1,
    price      INT          NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
--  TABEL SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
    `key`      VARCHAR(100) PRIMARY KEY,
    `value`    TEXT
) ENGINE=InnoDB;

-- ============================================================
--  DATA AWAL (SEED)
-- ============================================================

-- Password di-hash SHA-256:
--   admin123  => SHA2('admin123', 256)
--   user123   => SHA2('user123', 256)
INSERT INTO users (name, username, password, role, joined) VALUES
    ('Admin Utama',  'admin',     SHA2('admin123', 256), 'admin', '2024-01-01'),
    ('Budi Santoso', 'pelanggan', SHA2('user123',  256), 'user',  '2024-02-15')
ON DUPLICATE KEY UPDATE username = username;

INSERT INTO menu (name, category, price, description, emoji, status) VALUES
    ('Dimsum Ayam Original',    'Dimsum', 3000,  'Dimsum dengan isian daging ayam cincang, dibalut kulit tipis yang dikukus hingga kenyal sempurna.',                        '🥟', 'active'),
    ('Dimsum Mentai',           'Dimsum', 20000, 'Dimsum dengan isian daging ayam yang dipadukan dengan saus mentai creamy dan dibakar tipis untuk aroma smoky.',            '🧈', 'active'),
    ('Gyoza Ayam — Kuah',       'Gyoza',  11000, 'Gyoza dengan isian daging ayam cincang, disajikan dalam rendaman kuah hangat yang segar.',                                '🍜', 'active'),
    ('Gyoza Ayam — Goreng',     'Gyoza',  11000, 'Gyoza dengan isian daging ayam cincang, digoreng hingga kulitnya garing merata namun tetap juicy di dalam.',              '🥟', 'active'),
    ('Gyoza Udang — Kuah',      'Gyoza',  12000, 'Gyoza dengan isian udang segar, berpadu sempurna dengan kuah kaldu bening yang kaya rasa.',                               '🦐', 'active'),
    ('Gyoza Udang — Goreng',    'Gyoza',  12000, 'Gyoza dengan isian udang dan ayam cincang yang digoreng, memberikan tekstur renyah di luar dan lembut di dalam.',         '🦐', 'active'),
    ('Gyoza Mentai (Ayam/Udang)','Gyoza', 12000, 'Gyoza dengan saus mentai creamy dan dibakar tipis untuk aroma smoky.',                                                    '🧈', 'active'),
    ('Wonton Kuah Seblak',      'Wonton', 15000, 'Wonton dengan isian daging ayam yang disajikan dengan kuah seblak, memberikan perpaduan rasa lokal yang mantap.',         '🔥', 'active'),
    ('Wonton Chili Oil',        'Wonton', 13000, 'Wonton dengan isian daging ayam padat yang disiram chili oil pedas gurih ala oriental.',                                  '🌶️','active')
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO settings (`key`, `value`) VALUES
    ('store_name',  "Dimcum A'SAM"),
    ('address',     'Perum Sawocangkring Permai Blok F12, Wonoayu, Sidoarjo'),
    ('whatsapp',    '+6283893331236'),
    ('hours_weekday','10:00 - 22:00'),
    ('hours_weekend','09:00 - 23:00')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- Contoh order & items
INSERT INTO orders (user_id, customer, total, status, order_date) VALUES
    (2, 'Budi Santoso', 53000, 'done',    '2024-03-10'),
    (2, 'Budi Santoso', 36000, 'pending', '2024-03-15');

INSERT INTO order_items (order_id, menu_name, qty, price) VALUES
    (1, 'Dimsum Mentai',     2, 20000),
    (1, 'Wonton Chili Oil',  1, 13000),
    (2, 'Gyoza Udang — Goreng', 3, 12000);
