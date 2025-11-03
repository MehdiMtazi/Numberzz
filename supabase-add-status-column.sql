-- =====================================================
-- MIGRATION: Ajouter la colonne "status" à la table numbers
-- =====================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- pour ajouter le champ status aux nombres existants
-- =====================================================

-- Ajouter la colonne status si elle n'existe pas
ALTER TABLE numbers 
ADD COLUMN IF NOT EXISTS status TEXT 
CHECK (status IN ('locked', 'unlocked', 'available', 'owned'));

-- Mettre à jour les valeurs existantes basées sur les champs actuels
UPDATE numbers
SET status = CASE
  -- Si l'utilisateur possède le nombre
  WHEN owner IS NOT NULL AND unlocked = true THEN 'owned'
  
  -- Si déverrouillé mais gratuit à claim
  WHEN unlocked = true AND is_free_to_claim = true AND owner IS NULL THEN 'unlocked'
  
  -- Si déverrouillé mais pas gratuit (premium easter egg)
  WHEN unlocked = true AND is_free_to_claim = false THEN 'available'
  
  -- Si locked (par défaut pour easter eggs non déverrouillés)
  WHEN is_easter_egg = true AND unlocked = false THEN 'locked'
  
  -- Pour les nombres normaux disponibles
  WHEN is_easter_egg = false AND owner IS NULL THEN 'available'
  
  -- Sinon locked par défaut
  ELSE 'locked'
END
WHERE status IS NULL;

-- =====================================================
-- Vérification
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed!';
  RAISE NOTICE '📊 Column "status" added to numbers table';
  RAISE NOTICE '🔄 Existing data updated based on current state';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Status values:';
  RAISE NOTICE '   - locked: Easter egg not yet discovered';
  RAISE NOTICE '   - unlocked: Free easter egg available to claim';
  RAISE NOTICE '   - available: Premium easter egg or regular number available';
  RAISE NOTICE '   - owned: Number owned by a user';
END $$;
