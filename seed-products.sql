-- Seed semua produk Katresna
-- Jalankan di Supabase SQL Editor setelah supabase-schema.sql

-- BOLEN
INSERT INTO products (name, description, price, category_id, image_url, weight_gram, is_available) VALUES
('Original Coklat',     'Bolen pisang premium isian coklat',         9890,  (SELECT id FROM categories WHERE slug='bolen'), 'https://lh3.googleusercontent.com/d/1X2ldqsXXB_ffDLGxOt1zbH8WljNzsixk', 150, true),
('Original Keju',       'Bolen pisang premium isian keju',           9890,  (SELECT id FROM categories WHERE slug='bolen'), 'https://lh3.googleusercontent.com/d/1-Bm-DmgpS4A2J0xcQLXLDUxOchRobNCc', 150, true),
('Almond Cream',        'Bolen pisang premium isian almond cream',   9890,  (SELECT id FROM categories WHERE slug='bolen'), 'https://lh3.googleusercontent.com/d/1pmYCDc_cwC4xG9WvHjziq-JqjVVcpKys', 150, true),
('Milky Soes',          'Bolen pisang premium isian milky',          10000, (SELECT id FROM categories WHERE slug='bolen'), 'https://lh3.googleusercontent.com/d/1xnyznl0lzy_OEumLNByWMk693ABO2tS4', 150, true),
('Abon',                'Bolen pisang premium isian abon',           9890,  (SELECT id FROM categories WHERE slug='bolen'), 'https://lh3.googleusercontent.com/d/1FO99hH71AIcH0AnUlylLiwtCBOMpd3Bu', 150, true),
('Mexican Coffee',      'Bolen pisang premium isian mexican coffee', 10000, (SELECT id FROM categories WHERE slug='bolen'), 'https://lh3.googleusercontent.com/d/1-9fPkhViqIIU9Kyye_xrIBEa-QvnAByA', 150, true),
('Choco Crunchy',       'Bolen pisang premium isian choco crunchy',  12384, (SELECT id FROM categories WHERE slug='bolen'), 'https://lh3.googleusercontent.com/d/1rM9Uh7gMD4LAaXVm375fxukcebjkbZFn', 150, true),
('Cranberry Cheese',    'Bolen pisang premium isian cranberry cheese',14655,(SELECT id FROM categories WHERE slug='bolen'), 'https://lh3.googleusercontent.com/d/1FVhEkMkQM9mosdQ5AMeEq6ZtqN1NqtqL', 150, true),
('Beefy Mac',           'Bolen pisang premium isian beefy mac',      12393, (SELECT id FROM categories WHERE slug='bolen'), 'https://lh3.googleusercontent.com/d/1CqjSpgMX1lcC7M01TA8peL5fEjpiJmN2', 150, true),
('Truffle Garlic Cheese','Bolen pisang premium isian truffle garlic cheese',12214,(SELECT id FROM categories WHERE slug='bolen'), 'https://lh3.googleusercontent.com/d/1RzBRxlh3VdyfCRFC41bXas_vFRs6oRun', 150, true),
('Onde',                'Bolen pisang premium isian onde',           9890,  (SELECT id FROM categories WHERE slug='bolen'), 'https://lh3.googleusercontent.com/d/15gkcTaSW7SL8znWcQ-LdP8MkpH9O-WcR', 150, true),
('Durian Mochi',        'Bolen pisang premium isian durian mochi',   9890,  (SELECT id FROM categories WHERE slug='bolen'), 'https://lh3.googleusercontent.com/d/1sM80e5_qOZtDrliut2JBAz6CqrSS76uQ', 150, true),
('Pistachio',           'Bolen pisang premium isian pistachio',      9890,  (SELECT id FROM categories WHERE slug='bolen'), 'https://lh3.googleusercontent.com/d/1U05vESyc_UnkRl5YFijqmWYLyOIN-2s0', 150, false);

-- BOX / PAKET
INSERT INTO products (name, description, price, category_id, image_url, weight_gram, is_available) VALUES
('Mix 8 (1 pcs/variant)', 'Paket 8 bolen 1 pcs setiap varian',          80000, (SELECT id FROM categories WHERE slug='box'), 'https://lh3.googleusercontent.com/d/1nFUOkYUkPl2gqr2J2YdIl548izJIXZUC', 500, true),
('Full Mix 4 Keju + 4 Coklat','Paket box isi 8: 4 keju & 4 coklat',     70000, (SELECT id FROM categories WHERE slug='box'), 'https://lh3.googleusercontent.com/d/1jQZ3UU70jwrRdoRU3fQxtXCP2Zxr_OAY', 500, true),
('Full Keju',             'Paket box isi 8 full keju',                   70000, (SELECT id FROM categories WHERE slug='box'), 'https://lh3.googleusercontent.com/d/1-pFE-aTVFzK8CNRsg5I5qCNG7kel783X', 500, true),
('Full Coklat',           'Paket box isi 8 full coklat',                 70000, (SELECT id FROM categories WHERE slug='box'), 'https://lh3.googleusercontent.com/d/1SaUteWJR_pxCZDo62-FUtXsR27Nr834Z', 500, true),
('Mix 4 Variant Classic', 'Box isi 4: OG Coklat, Keju, Almond, Milky',  80000, (SELECT id FROM categories WHERE slug='box'), 'https://lh3.googleusercontent.com/d/1DkYJ0cx7zEEpJDZTMrXga10DOV1A5Qty', 500, true),
('Mix 4 Variant Special', 'Box isi 4: OG Coklat, Keju, Abon, Mexican',  80000, (SELECT id FROM categories WHERE slug='box'), 'https://lh3.googleusercontent.com/d/1-9P7VXtBrrS4Y5eWlOF2OXBeeOhFgd-L', 500, true),
('Box Isi 4 Premium',     'Box isi 4: Choco Crunchy, Cranberry, Beefy Mac, Truffle', 48000, (SELECT id FROM categories WHERE slug='box'), NULL, 400, true);

-- BEVERAGES
INSERT INTO products (name, description, price, category_id, image_url, weight_gram, is_available) VALUES
('Deep Ocean',         'Minuman segar Deep Ocean',        31500, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/1Qij5RVeX5-AShhqZ6wDY9LoYbJ1lV45O', 400, true),
('Banana Cano',        'Minuman segar Banana Cano',       31500, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/1WoEbgKReXJaDEaIGx_ebgP4c05VOLp8D', 400, true),
('Apple Pie',          'Minuman segar Apple Pie',         34650, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/1pkXviIizPGyaZKIfX7kI5rtUGd2g3C_L', 400, true),
('Violet Lychee Tea',  'Teh lychee violet segar',         31500, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/1lJJSRkfqfLdm7j7c8-U2VLzQwAQMUvjQ', 400, true),
('Kopi Susu Bolen',    'Kopi susu khas Katresna',         36750, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/1uFsDAfRXazY1SyJaVVDGEuGtFeLCjXI_', 400, true),
('Coffee Mocktail',    'Coffee mocktail unik Katresna',   36750, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/1UYeP1ycXZ1lwrlsaUxlhLRrF74dOWfqf', 400, true),
('Kopi Susu Cinnamon', 'Kopi susu dengan sentuhan cinnamon',31500,(SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/1MvV7WxO-f8bLvEA23KkrcWdy3PO-g2hZ', 400, true),
('Choco Dream',        'Minuman coklat premium',          31500, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/14fnV2ylXKG2xaMG7tODoNmoLLJdkdIZs', 400, true),
('Ice Americano',      'Espresso dengan es batu',         28350, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/1cpVhGne4xo7Fw51F5RMNclbI29qKvtle', 400, true),
('Espresso',           'Single shot espresso pekat',      20000, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/1ZzjAUgbDCsGKxIpPDp3Ny4R1ikC0U9tI', 300, true),
('Ice Latte',          'Espresso dengan susu dan es',     31500, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/1GblOcWvsu-MQSlvq6u42Rgj_TVC26gu3', 400, true),
('Hot Latte',          'Espresso dengan susu hangat',     31500, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/19AchA5Mwq8RhfZoLBhZnNkAPk0D1-mVD', 350, true),
('Cappucino',          'Espresso dengan foam susu',       29400, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/1flcfIQDLY3XBMqiT6m9suXgOfkM4H7gK', 350, true),
('Piccolo / Magic',    'Piccolo latte atau magic coffee',  35000, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/1MZnzoIlTD6ZTzxZSLhK-ntcK1ogVYsSi', 350, true),
('Bubblegum Milk',     'Susu bubblegum segar',            31500, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/1tHWTDVaEyKuQYwqUSYkln5Y8H9vC3-GV', 400, true),
('Regal Milk',         'Susu Regal creamy',               28000, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/1DSZ2KYMU123ubduMcChou2koFqzWHBZK', 400, true),
('Cookies Milk',       'Susu dengan cookies renyah',      28000, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/1HApzL2blNR52fvOI3Jtw696AwVb8mz0c', 400, true),
('Milk Vanilla',       'Susu vanilla lembut',             25000, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/114O-ayi1WqudQjsKjrY1iVHLndHv_7o8', 400, true),
('Brown Sugar',        'Minuman brown sugar kekinian',    25000, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/1xs7G6O0_dSdWX4V4tJ7dcmTJx-kGwjn_', 400, true),
('Artisan Tea',        'Teh artisan pilihan',             30000, (SELECT id FROM categories WHERE slug='beverages'), 'https://lh3.googleusercontent.com/d/1shZ3cqgTMu9StABXwKQxcTQnoczI6eEQ', 400, true);
