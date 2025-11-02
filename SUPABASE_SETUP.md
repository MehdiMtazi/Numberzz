# 🚀 Guide de Migration vers Supabase

Ce guide explique comment configurer Supabase pour synchroniser les données de Numberzz entre différents appareils et utilisateurs.

---

## 📋 Étapes à Suivre

### ✅ Étape 1 : Créer un Compte Supabase

1. Aller sur [https://supabase.com](https://supabase.com)
2. Cliquer sur "Start your project" ou "Sign up"
3. Se connecter avec GitHub (recommandé) ou créer un compte email
4. C'est **100% gratuit** jusqu'à 500 MB de données

---

### ✅ Étape 2 : Créer un Nouveau Projet

1. Une fois connecté, cliquer sur "New project"
2. Remplir les informations :
   - **Name** : `numberzz` (ou le nom de votre choix)
   - **Database Password** : Générer un mot de passe fort (le noter !)
   - **Region** : Choisir le plus proche de vos utilisateurs (ex: `Europe (Paris)`)
   - **Pricing Plan** : Laisser "Free"
3. Cliquer sur "Create new project"
4. ⏳ Attendre 1-2 minutes que le projet soit créé

---

### ✅ Étape 3 : Exécuter le Script SQL

1. Dans votre projet Supabase, aller dans **SQL Editor** (menu de gauche, icône <>)
2. Cliquer sur **"New query"**
3. Ouvrir le fichier `supabase-schema.sql` de ce projet
4. **Copier TOUT le contenu** du fichier SQL
5. **Coller** dans l'éditeur SQL de Supabase
6. Cliquer sur **"Run"** (en bas à droite)
7. ✅ Vous devriez voir : **"Success. No rows returned"**

**Ce script crée automatiquement :**
- 4 tables : `numbers`, `sale_contracts`, `certificates`, `interested_buyers`
- Tous les index pour la performance
- Les politiques de sécurité (RLS)
- Les triggers pour les mises à jour automatiques

---

### ✅ Étape 4 : Activer le Temps Réel (Realtime)

Pour que les changements se synchronisent instantanément entre appareils :

1. Aller dans **Database** → **Replication** (menu de gauche)
2. Activer "Enable Replication" si ce n'est pas déjà fait
3. Cocher les 4 tables suivantes :
   - ✅ `numbers`
   - ✅ `sale_contracts`
   - ✅ `certificates`
   - ✅ `interested_buyers`
4. Cliquer sur **"Save"**

---

### ✅ Étape 5 : Copier les Clés API

1. Aller dans **Settings** → **API** (menu de gauche, icône ⚙️)
2. Vous verrez deux sections importantes :

#### **Project URL**
```
https://xxxxxxxxxxxxx.supabase.co
```
👆 Copier cette URL

#### **Project API keys** → **anon public**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...
```
👆 Copier cette clé (très longue, commencer par `eyJ`)

---

### ✅ Étape 6 : Configurer les Variables d'Environnement

1. À la racine de votre projet, **créer le fichier `.env.local`** (s'il n'existe pas)
2. Ajouter vos clés Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Remplacer** :
- `https://xxxxxxxxxxxxx.supabase.co` par votre Project URL
- `eyJhbGciOi...` par votre anon public key

💡 **Note** : Le fichier `.env.local` est déjà dans `.gitignore` donc ne sera PAS committé.

---

### ✅ Étape 7 : Installer la Dépendance Supabase

**IMPORTANT** : Il y a un problème avec `npm install` via PowerShell sur WSL. Utiliser WSL directement :

#### Option A : Via WSL Terminal
```bash
cd /home/mehdi/Numberzz2
npm install @supabase/supabase-js
```

#### Option B : Via PowerShell (si ça fonctionne)
```powershell
wsl -d Ubuntu -e bash -c "cd /home/mehdi/Numberzz2 && npm install @supabase/supabase-js"
```

#### Option C : Depuis VS Code Terminal (en mode WSL)
```bash
npm install @supabase/supabase-js
```

✅ Une fois installé, vous verrez dans `package.json` :
```json
"dependencies": {
  "@supabase/supabase-js": "^2.x.x",
  ...
}
```

---

### ✅ Étape 8 : Tester la Connexion

1. **Démarrer le serveur de développement** :
```bash
npm run dev
```

2. **Ouvrir votre navigateur** : [http://localhost:3000](http://localhost:3000)

3. **Vérifier dans la console du navigateur** (F12) :
   - ✅ Vous devriez voir : `"✅ Données chargées depuis Supabase"`
   - ✅ Si la DB est vide : `"🚀 Base de données vide - Initialisation..."`

4. **Connecter votre wallet** et **acheter un nombre**

5. **Ouvrir un NOUVEL ONGLET** (ou un autre appareil) → même URL

6. ✨ **Le nombre acheté devrait apparaître immédiatement !**

---

## 🎯 Comment ça Fonctionne Maintenant ?

### **AVANT (localStorage)**
```
Utilisateur A (PC) → localStorage navigateur A
Utilisateur B (Mobile) → localStorage navigateur B
❌ AUCUNE COMMUNICATION
```

### **APRÈS (Supabase)**
```
┌──────────────┐
│ Utilisateur A│──┐
│   (PC)       │  │
└──────────────┘  │
                  │    ┌─────────────┐
                  ├───▶│   Supabase  │◀─── Tous les appareils
                  │    │  (Database) │     se synchronisent
┌──────────────┐  │    └─────────────┘     en TEMPS RÉEL
│ Utilisateur B│──┘
│  (Mobile)    │
└──────────────┘
```

### **Synchronisation en Temps Réel**
- 🔄 Dès qu'un utilisateur achète un nombre → **TOUS les appareils** voient le changement
- 🔄 Dès qu'un utilisateur met un nombre en vente → Visible **PARTOUT**
- 🔄 Dès qu'un utilisateur montre son intérêt → **SYNCHRONISÉ**
- ⚡ **Instantané** : < 1 seconde de latence

---

## 🔧 Fonctionnalités Disponibles

### ✅ Ce Qui Est Synchronisé

- ✅ Tous les nombres (ownership, prix, rareté)
- ✅ Les ventes (fixedPrice et buyOffer)
- ✅ Les certificats de propriété
- ✅ Les utilisateurs intéressés avec leur prix
- ✅ Les easter eggs débloqués
- ✅ Tout en **temps réel** !

### ✅ Fonctions Automatiques

Le hook `useSupabaseData` gère automatiquement :
- 🔄 Chargement initial des données
- 🔄 Synchronisation temps réel via WebSocket
- 💾 Sauvegarde automatique après chaque action
- 🔁 Rechargement si connexion perdue
- 🛡️ Gestion des erreurs

---

## 🗑️ Réinitialiser les Données

### Pour l'Administrateur (Bank Wallet)

Le bouton **"Clear Data"** fonctionne toujours et supprime maintenant :
- ❌ Toutes les données dans Supabase (pour TOUS les utilisateurs)
- ❌ Tous les ownerships
- ❌ Tous les contrats de vente
- ❌ Tous les certificats
- ❌ Tous les intéressés

Puis réinitialise avec les données par défaut.

---

## 🐛 Dépannage

### Problème : "Failed to fetch"

**Solution** :
1. Vérifier que `.env.local` existe et contient les bonnes clés
2. Redémarrer le serveur : `npm run dev`
3. Vider le cache du navigateur (Ctrl+Shift+R)

### Problème : "Row Level Security"

**Solution** :
1. Vérifier que le script SQL a bien été exécuté
2. Dans Supabase → Authentication → Policies
3. Vérifier que toutes les tables ont les policies "Allow public..."

### Problème : Les changements ne se synchronisent pas

**Solution** :
1. Vérifier que Realtime est activé (Database → Replication)
2. Vérifier les 4 tables sont cochées
3. Dans la console navigateur (F12), vérifier : `"🔄 Numbers changed:"`

### Problème : npm install ne fonctionne pas

**Solution** :
1. Utiliser WSL directement (pas PowerShell)
2. Ou installer manuellement depuis le terminal VS Code en mode WSL
3. Si problème persiste, supprimer `node_modules` et réinstaller :
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

---

## 📊 Vérifier l'État de la Base

### Via l'Interface Supabase

1. Aller dans **Table Editor** (menu de gauche)
2. Cliquer sur la table `numbers`
3. Vous verrez tous les nombres en temps réel
4. Vous pouvez même modifier manuellement les données ici !

### Via SQL

1. Aller dans **SQL Editor**
2. Exécuter ces requêtes :

```sql
-- Voir tous les nombres
SELECT * FROM numbers ORDER BY id;

-- Voir les nombres vendus
SELECT * FROM numbers WHERE owner IS NOT NULL;

-- Voir les ventes actives
SELECT * FROM sale_contracts WHERE status = 'active';

-- Voir qui est intéressé
SELECT * FROM interested_buyers;
```

---

## 🚀 Next Steps

### Optimisations Possibles

1. **Authentification** : Ajouter Supabase Auth pour identifier les utilisateurs
2. **Policies Strictes** : Limiter qui peut modifier quoi
3. **Storage** : Uploader des images de nombres
4. **Edge Functions** : Automatiser certaines actions côté serveur

### Production

Pour déployer sur Vercel :
1. Aller dans Vercel Dashboard → Your Project → Settings → Environment Variables
2. Ajouter :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redéployer

---

## ✅ Résumé

Avec Supabase, tu as maintenant :
- ✅ **Synchronisation multi-appareils** en temps réel
- ✅ **Base de données centralisée** accessible partout
- ✅ **Temps réel** : tous les utilisateurs voient les mêmes données instantanément
- ✅ **Gratuit** jusqu'à 500MB et 50,000 utilisateurs mensuels
- ✅ **Scalable** : prêt pour la production

**Plus de problème de localStorage limité à un seul appareil !** 🎉

---

## 📞 Besoin d'Aide ?

- 📖 [Documentation Supabase](https://supabase.com/docs)
- 💬 [Discord Supabase](https://discord.supabase.com)
- 🎥 [Tutoriels vidéo](https://www.youtube.com/c/supabase)

---

**Créé le** : 2 Novembre 2025  
**Auteur** : Migration Numberzz vers Supabase
