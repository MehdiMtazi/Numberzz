-- =====================================================
-- SUPABASE SCHEMA FOR NUMBERZZ
-- =====================================================
-- This file contains all the SQL commands to set up your database
-- Run this in the Supabase SQL Editor (https://app.supabase.com)
-- =====================================================

-- Table pour les nombres (numbers)
CREATE TABLE IF NOT EXISTS numbers (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('Ultimate', 'Legendary', 'Rare', 'Uncommon', 'Common', 'Exotic')),
  price_eth TEXT NOT NULL,
  owner TEXT,
  unlocked BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('locked', 'unlocked', 'available', 'owned')),
  description TEXT,
  for_sale BOOLEAN DEFAULT false,
  sale_price TEXT,
  interested_count INTEGER DEFAULT 0,
  interested_by TEXT[] DEFAULT '{}',
  is_easter_egg BOOLEAN DEFAULT false,
  easter_egg_name TEXT,
  is_free_to_claim BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table pour les contrats de vente (sale_contracts)
CREATE TABLE IF NOT EXISTS sale_contracts (
  id TEXT PRIMARY KEY,
  num_id TEXT NOT NULL REFERENCES numbers(id) ON DELETE CASCADE,
  seller TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('buyOffer', 'fixedPrice')),
  price_eth TEXT,
  created_at BIGINT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'completed', 'cancelled')),
  comment TEXT,
  created_timestamp TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table pour les certificats (certificates)
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  num_id TEXT NOT NULL REFERENCES numbers(id) ON DELETE CASCADE,
  owner TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  issued_at TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table pour les intéressés (interested_buyers)
CREATE TABLE IF NOT EXISTS interested_buyers (
  id SERIAL PRIMARY KEY,
  num_id TEXT NOT NULL REFERENCES numbers(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  price_eth TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(num_id, address)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_numbers_owner ON numbers(owner);
CREATE INDEX IF NOT EXISTS idx_numbers_rarity ON numbers(rarity);
CREATE INDEX IF NOT EXISTS idx_numbers_for_sale ON numbers(for_sale);
CREATE INDEX IF NOT EXISTS idx_sale_contracts_num_id ON sale_contracts(num_id);
CREATE INDEX IF NOT EXISTS idx_sale_contracts_seller ON sale_contracts(seller);
CREATE INDEX IF NOT EXISTS idx_sale_contracts_status ON sale_contracts(status);
CREATE INDEX IF NOT EXISTS idx_certificates_num_id ON certificates(num_id);
CREATE INDEX IF NOT EXISTS idx_certificates_owner ON certificates(owner);
CREATE INDEX IF NOT EXISTS idx_interested_buyers_num_id ON interested_buyers(num_id);
CREATE INDEX IF NOT EXISTS idx_interested_buyers_address ON interested_buyers(address);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interested_buyers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES - Autoriser lecture/écriture publique
-- NOTE: Pour une app de production, vous devriez restreindre ces permissions
-- =====================================================

-- Numbers table policies
DROP POLICY IF EXISTS "Allow public read numbers" ON numbers;
CREATE POLICY "Allow public read numbers" ON numbers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert numbers" ON numbers;
CREATE POLICY "Allow public insert numbers" ON numbers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update numbers" ON numbers;
CREATE POLICY "Allow public update numbers" ON numbers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete numbers" ON numbers;
CREATE POLICY "Allow public delete numbers" ON numbers FOR DELETE USING (true);

-- Sale contracts policies
DROP POLICY IF EXISTS "Allow public read sale_contracts" ON sale_contracts;
CREATE POLICY "Allow public read sale_contracts" ON sale_contracts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert sale_contracts" ON sale_contracts;
CREATE POLICY "Allow public insert sale_contracts" ON sale_contracts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update sale_contracts" ON sale_contracts;
CREATE POLICY "Allow public update sale_contracts" ON sale_contracts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete sale_contracts" ON sale_contracts;
CREATE POLICY "Allow public delete sale_contracts" ON sale_contracts FOR DELETE USING (true);

-- Certificates policies
DROP POLICY IF EXISTS "Allow public read certificates" ON certificates;
CREATE POLICY "Allow public read certificates" ON certificates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert certificates" ON certificates;
CREATE POLICY "Allow public insert certificates" ON certificates FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete certificates" ON certificates;
CREATE POLICY "Allow public delete certificates" ON certificates FOR DELETE USING (true);

-- Interested buyers policies
DROP POLICY IF EXISTS "Allow public read interested_buyers" ON interested_buyers;
CREATE POLICY "Allow public read interested_buyers" ON interested_buyers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert interested_buyers" ON interested_buyers;
CREATE POLICY "Allow public insert interested_buyers" ON interested_buyers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update interested_buyers" ON interested_buyers;
CREATE POLICY "Allow public update interested_buyers" ON interested_buyers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete interested_buyers" ON interested_buyers;
CREATE POLICY "Allow public delete interested_buyers" ON interested_buyers FOR DELETE USING (true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_numbers_updated_at ON numbers;
CREATE TRIGGER update_numbers_updated_at
    BEFORE UPDATE ON numbers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sale_contracts_updated_at ON sale_contracts;
CREATE TRIGGER update_sale_contracts_updated_at
    BEFORE UPDATE ON sale_contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_certificates_updated_at ON certificates;
CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interested_buyers_updated_at ON interested_buyers;
CREATE TRIGGER update_interested_buyers_updated_at
    BEFORE UPDATE ON interested_buyers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================
-- Activer les subscriptions en temps réel pour toutes les tables
-- (À faire via l'interface Supabase: Database > Replication)

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📊 Tables: numbers, sale_contracts, certificates, interested_buyers';
  RAISE NOTICE '🔐 RLS enabled with public policies';
  RAISE NOTICE '⚡ Triggers configured for auto-updates';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next steps:';
  RAISE NOTICE '1. Enable Realtime in Database > Replication for all tables';
  RAISE NOTICE '2. Copy your Supabase URL and anon key to .env.local';
  RAISE NOTICE '3. Run npm install @supabase/supabase-js';
  RAISE NOTICE '4. Start your Next.js app!';
END $$;
