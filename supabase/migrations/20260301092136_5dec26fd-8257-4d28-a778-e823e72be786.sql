
-- Seed menu_items
INSERT INTO public.menu_items (name, description, category, calories, protein, carbs, fat) VALUES
('Nasi Goreng Ayam', 'Nasi goreng dengan potongan ayam dan sayuran', 'main', 450, 18, 55, 12),
('Soto Ayam', 'Soto ayam kuning dengan bihun dan telur', 'main', 380, 22, 40, 10),
('Nasi Kuning Komplit', 'Nasi kuning dengan lauk ayam, telur, dan sambal', 'main', 520, 25, 60, 15),
('Mie Goreng Sayur', 'Mie goreng dengan aneka sayuran segar', 'main', 400, 12, 50, 14),
('Bubur Ayam', 'Bubur ayam dengan cakwe dan kerupuk', 'main', 320, 15, 45, 8),
('Susu Kotak UHT', 'Susu UHT rasa coklat 200ml', 'drink', 140, 5, 20, 4),
('Jus Jeruk', 'Jus jeruk segar tanpa gula tambahan', 'drink', 90, 1, 22, 0),
('Pisang', 'Pisang ambon segar', 'snack', 105, 1, 27, 0),
('Puding Buah', 'Puding susu dengan potongan buah segar', 'snack', 150, 3, 28, 3);

-- Seed schools
INSERT INTO public.schools (name, address, student_count, contact_person, contact_phone) VALUES
('SDN 01 Menteng', 'Jl. Besuki No.1, Menteng, Jakarta Pusat', 320, 'Ibu Sari', '081234567890'),
('SDN 02 Gambir', 'Jl. Tanah Abang III No.5, Gambir, Jakarta Pusat', 280, 'Bapak Andi', '081298765432'),
('SDN 03 Kemayoran', 'Jl. Bungur Besar No.12, Kemayoran, Jakarta Pusat', 350, 'Ibu Dewi', '085611223344'),
('SDN 04 Cempaka Putih', 'Jl. Cempaka Putih Tengah No.8, Jakarta Pusat', 300, 'Bapak Rudi', '087855667788'),
('SDN 05 Senen', 'Jl. Kramat Raya No.15, Senen, Jakarta Pusat', 260, 'Ibu Lina', '082199887766');

-- Seed inventory_items
INSERT INTO public.inventory_items (name, category, unit, current_stock, min_stock, price_per_unit, supplier) VALUES
('Beras Premium', 'grain', 'kg', 500, 100, 14000, 'PT Beras Nusantara'),
('Minyak Goreng', 'oil', 'liter', 80, 20, 18000, 'PT Sinar Mas'),
('Ayam Potong', 'protein', 'kg', 120, 30, 38000, 'CV Ayam Segar'),
('Telur Ayam', 'protein', 'kg', 100, 25, 28000, 'UD Telur Makmur'),
('Bawang Merah', 'spice', 'kg', 30, 10, 35000, 'Pasar Induk Kramat Jati'),
('Bawang Putih', 'spice', 'kg', 25, 8, 32000, 'Pasar Induk Kramat Jati'),
('Gula Pasir', 'other', 'kg', 50, 15, 16000, 'PT Gula Manis'),
('Susu UHT Coklat', 'drink', 'box', 600, 200, 4500, 'PT Frisian Flag'),
('Mie Telur', 'grain', 'kg', 60, 15, 12000, 'PT Indofood'),
('Wortel', 'vegetable', 'kg', 40, 10, 12000, 'Pasar Induk Kramat Jati'),
('Kentang', 'vegetable', 'kg', 35, 10, 15000, 'Pasar Induk Kramat Jati'),
('Garam', 'spice', 'kg', 20, 5, 8000, 'PT Garam Nasional');
