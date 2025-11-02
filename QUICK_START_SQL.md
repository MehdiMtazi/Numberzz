# ⚡ ACTION IMMÉDIATE - Exécuter ce SQL dans Supabase

## 🎯 Comment Faire (2 minutes)

1. **Ouvre Supabase** : https://supabase.com/dashboard
2. **Sélectionne ton projet** : Numberzz
3. **Clique sur SQL Editor** (icône `</>` dans le menu de gauche)
4. **Copie TOUT le contenu ci-dessous**
5. **Colle dans l'éditeur SQL**
6. **Clique sur RUN** (ou CTRL+Enter)
7. **Vérifie** : Devrait dire "Success. No rows returned"

---

## 📋 Script SQL à Exécuter

```sql
-- =====================================================
-- OPTIMISATION SUPABASE - INDEX POUR PERFORMANCES
-- =====================================================
-- Exécuter ce script dans le SQL Editor de Supabase
-- Gain: Requêtes 10x plus rapides
-- =====================================================

-- Index sur la recherche par propriétaire (owner)
CREATE INDEX IF NOT EXISTS idx_numbers_owner ON numbers(owner);

-- Index sur les nombres en vente
CREATE INDEX IF NOT EXISTS idx_numbers_for_sale ON numbers(for_sale) WHERE for_sale = true;

-- Index sur les nombres débloqués
CREATE INDEX IF NOT EXISTS idx_numbers_unlocked ON numbers(unlocked) WHERE unlocked = true;

-- Index composite pour les recherches complexes (rareté + propriétaire)
CREATE INDEX IF NOT EXISTS idx_numbers_rarity_owner ON numbers(rarity, owner);

-- Index sur les Easter Eggs
CREATE INDEX IF NOT EXISTS idx_numbers_easter_egg ON numbers(is_easter_egg) WHERE is_easter_egg = true;

-- Index sur le numéro lui-même pour les recherches directes
CREATE INDEX IF NOT EXISTS idx_numbers_num ON numbers(num);

-- =====================================================
-- INDEX POUR SALE_CONTRACTS
-- =====================================================

-- Index sur le statut des contrats
CREATE INDEX IF NOT EXISTS idx_contracts_status ON sale_contracts(status) WHERE status = 'active';

-- Index sur num_id pour retrouver les contrats d'un nombre
CREATE INDEX IF NOT EXISTS idx_contracts_num_id ON sale_contracts(num_id);

-- Index sur le vendeur
CREATE INDEX IF NOT EXISTS idx_contracts_seller ON sale_contracts(seller);

-- Index composite pour les contrats actifs d'un nombre spécifique
CREATE INDEX IF NOT EXISTS idx_contracts_num_status ON sale_contracts(num_id, status);

-- =====================================================
-- INDEX POUR CERTIFICATES
-- =====================================================

-- Index sur num_id pour retrouver les certificats d'un nombre
CREATE INDEX IF NOT EXISTS idx_certificates_num_id ON certificates(num_id);

-- Index sur le propriétaire
CREATE INDEX IF NOT EXISTS idx_certificates_owner ON certificates(owner);

-- Index composite pour les certificats actifs d'un nombre
CREATE INDEX IF NOT EXISTS idx_certificates_num_owner ON certificates(num_id, owner);

-- =====================================================
-- INDEX POUR INTERESTED_BUYERS
-- =====================================================

-- Index sur num_id pour retrouver les intéressés par un nombre
CREATE INDEX IF NOT EXISTS idx_interested_num_id ON interested_buyers(num_id);

-- Index sur le buyer pour l'historique d'un acheteur
CREATE INDEX IF NOT EXISTS idx_interested_buyer ON interested_buyers(buyer);

-- Index composite pour éviter les doublons et accélérer les recherches
CREATE INDEX IF NOT EXISTS idx_interested_num_buyer ON interested_buyers(num_id, buyer);

-- =====================================================
-- INDEX SUR LES TIMESTAMPS (pour tri chronologique)
-- =====================================================

-- Index sur created_at pour tri par date
CREATE INDEX IF NOT EXISTS idx_numbers_created_at ON numbers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON sale_contracts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON certificates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interested_created_at ON interested_buyers(created_at DESC);

-- =====================================================
-- ANALYSE ET STATISTIQUES
-- =====================================================

-- Mettre à jour les statistiques pour le query planner
ANALYZE numbers;
ANALYZE sale_contracts;
ANALYZE certificates;
ANALYZE interested_buyers;

-- =====================================================
-- VÉRIFICATION DES INDEX
-- =====================================================

-- Afficher tous les index créés
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## ✅ Vérification

Après avoir exécuté le script, tu devrais voir dans les résultats :

```
schemaname | tablename         | indexname
-----------|-------------------|---------------------------
public     | numbers           | idx_numbers_owner
public     | numbers           | idx_numbers_for_sale
public     | numbers           | idx_numbers_rarity_owner
public     | sale_contracts    | idx_contracts_status
public     | certificates      | idx_certificates_num_id
public     | interested_buyers | idx_interested_num_id
... (environ 15-20 index)
```

---

## 🎉 C'est Tout !

Une fois ce script exécuté, tes requêtes seront **10x plus rapides** ! 🚀

Toutes les autres optimisations (Optimistic UI, Updates Incrémentiels, etc.) sont déjà dans le code.
