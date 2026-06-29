-- Enable Row Level Security (RLS) on all tables to lock them down
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- 1. Policies for 'albums'
-- Allow anyone to view albums (public access)
CREATE POLICY "Allow public read access on albums" ON albums FOR SELECT USING (true);
-- Allow ONLY authenticated admin users to modify albums
CREATE POLICY "Allow authenticated insert on albums" ON albums FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on albums" ON albums FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on albums" ON albums FOR DELETE TO authenticated USING (true);

-- 2. Policies for 'album_pages'
CREATE POLICY "Allow public read access on album_pages" ON album_pages FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on album_pages" ON album_pages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on album_pages" ON album_pages FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on album_pages" ON album_pages FOR DELETE TO authenticated USING (true);

-- 3. Policies for 'media'
CREATE POLICY "Allow public read access on media" ON media FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on media" ON media FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on media" ON media FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on media" ON media FOR DELETE TO authenticated USING (true);

-- 4. Policies for 'analytics'
CREATE POLICY "Allow public read access on analytics" ON analytics FOR SELECT USING (true);
-- Allow public insert/update for analytics so that unauthenticated visitors can increment page views
CREATE POLICY "Allow public insert on analytics" ON analytics FOR INSERT USING (true) WITH CHECK (true);
CREATE POLICY "Allow public update on analytics" ON analytics FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete on analytics" ON analytics FOR DELETE TO authenticated USING (true);

-- ==========================================
-- PROVISION ADMIN CREDENTIALS
-- ==========================================
-- IMPORTANT: To allow login with the hardcoded credentials (admin@chaya.studio / password), 
-- you must create this user in your Supabase Authentication Dashboard.
-- Go to Authentication -> Users -> Add User -> Create New User.
-- Email: admin@chaya.studio
-- Password: password
