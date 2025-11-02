# ✅ Actions à Faire Manuellement

## 🔴 URGENT : Installer Supabase

Le problème avec npm via PowerShell/WSL nécessite une installation manuelle.

### Ouvrir un Terminal WSL :

1. **Ouvrir VS Code Terminal**
2. **Changer vers WSL** : Cliquer sur le `+` et choisir "Ubuntu (WSL)"
3. **Naviguer vers le projet** :
```bash
cd /home/mehdi/Numberzz2
```

4. **Installer Supabase** :
```bash
npm install @supabase/supabase-js
```

---

## 📋 Configuration Supabase (Étape par Étape)

### 1. Créer un Compte Supabase
- ✅ Aller sur https://supabase.com
- ✅ Cliquer sur "Start your project"
- ✅ Se connecter avec GitHub (recommandé)

### 2. Créer un Projet
- ✅ Cliquer sur "New project"
- ✅ Name: `numberzz`
- ✅ Database Password: **NOTER LE MOT DE PASSE**
- ✅ Region: Europe (Paris)
- ✅ Cliquer "Create new project" (attendre 1-2 min)

### 3. Exécuter le Script SQL
- ✅ Aller dans **SQL Editor** (menu gauche)
- ✅ Cliquer "New query"
- ✅ Ouvrir le fichier `supabase-schema.sql`
- ✅ **COPIER TOUT** le contenu
- ✅ **COLLER** dans l'éditeur SQL
- ✅ Cliquer **"Run"**
- ✅ Attendre "Success. No rows returned"

### 4. Activer le Temps Réel
- ✅ Aller dans **Database → Replication**
- ✅ Activer "Enable Replication"
- ✅ Cocher les 4 tables :
  - `numbers`
  - `sale_contracts`
  - `certificates`
  - `interested_buyers`
- ✅ Cliquer "Save"

### 5. Copier les Clés API
- ✅ Aller dans **Settings → API**
- ✅ Copier **Project URL** (https://xxxxx.supabase.co)
- ✅ Copier **anon public key** (commence par eyJ...)

### 6. Créer `.env.local`
- ✅ À la racine du projet, créer `.env.local`
- ✅ Ajouter :
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- ✅ **REMPLACER** par tes vraies valeurs

---

## 🧪 Tester

1. **Démarrer le serveur** :
```bash
npm run dev
```

2. **Ouvrir le navigateur** : http://localhost:3000

3. **Vérifier la console** (F12) :
   - ✅ "✅ Données chargées depuis Supabase"
   - ✅ "🚀 Base de données vide - Initialisation..."

4. **Connecter le wallet** et **acheter un nombre**

5. **Ouvrir un NOUVEL ONGLET** → même URL

6. ✅ Le nombre acheté devrait apparaître instantanément !

---

## 📁 Fichiers Créés

Tous ces fichiers ont été créés et sont prêts :

✅ `lib/supabase.ts` - Configuration client Supabase
✅ `lib/hooks/useSupabaseData.ts` - Hook pour gérer les données
✅ `supabase-schema.sql` - Script SQL pour créer les tables
✅ `.env.local.example` - Template pour les variables d'environnement
✅ `SUPABASE_SETUP.md` - Guide complet (ce fichier est la version courte)

---

## ⚠️ Ce Qu'il Reste à Faire

### Option 1 : Utiliser le Hook (Recommandé)

Il faut modifier `app/page.tsx` pour utiliser le hook `useSupabaseData` au lieu de `localStorage`.

Je peux le faire maintenant si tu veux, mais ce sera un gros changement.

### Option 2 : Migration Progressive

Tu peux d'abord tester Supabase avec les fichiers actuels, puis migrer `page.tsx` plus tard.

---

## 🚨 Important

**NE PAS COMMITTER** le fichier `.env.local` sur Git !
Il est déjà dans `.gitignore`.

---

## 💡 Questions ?

Lis `SUPABASE_SETUP.md` pour le guide complet avec plus de détails.
