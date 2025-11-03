# 📊 Guide du Champ `status` pour les Easter Eggs

## 🎯 Objectif

Le champ `status` simplifie la gestion des états des Easter eggs en regroupant plusieurs conditions (`unlocked`, `owner`, `isFreeToClaim`) en un seul champ explicite.

---

## 🔢 Les 4 États Possibles

### 1. **`locked`** 🔒
- **Signification** : Easter egg non découvert
- **Affichage** : Badge "🔒 Locked"
- **Action possible** : Débloquer via action (clics, recherche)
- **Exemple** : Chroma Coin avant les 7 clics sur le logo

### 2. **`unlocked`** 🎁
- **Signification** : Easter egg gratuit débloqué, disponible pour claim
- **Affichage** : Badge "🔓 Unlocked (Free!)"
- **Action possible** : Claim gratuit (devient `owned`)
- **Exemple** : Darius Coin après recherche "darius", avant claim

### 3. **`available`** ✨
- **Signification** : Easter egg premium débloqué, disponible à l'achat
- **Affichage** : Badge "✨ Available"
- **Action possible** : Marquer intérêt, acheter si mis en vente
- **Exemple** : Wukong Coin après recherche "wukong"

### 4. **`owned`** 🎉
- **Signification** : Nombre possédé par l'utilisateur
- **Affichage** : Badge "🎉 You Own"
- **Action possible** : Vendre, gérer
- **Exemple** : Chroma Coin après claim réussi

---

## 🔄 Flux de Transition des États

### **Easter Eggs Gratuits** (isFreeToClaim = true)
```
locked → unlocked → owned
  ↓         ↓         ↓
 🔒       🎁       🎉
Clics    Claim    Your
Logo    Réussi   Collection
```

### **Easter Eggs Premium** (isFreeToClaim = false)
```
locked → available → owned
  ↓          ↓         ↓
 🔒        ✨       🎉
Recherche  Achat   Your
"wukong"  Réussi  Collection
```

---

## 🛠️ Migration depuis l'Ancien Système

### **Avant** (champs multiples) :
```typescript
if (item.unlocked && item.isFreeToClaim && !item.owner) {
  // Easter egg débloqué et gratuit
}
if (item.owner?.toLowerCase() === account?.toLowerCase()) {
  // Possédé par l'utilisateur
}
```

### **Maintenant** (champ unique) :
```typescript
switch (item.status) {
  case "locked": // 🔒
  case "unlocked": // 🎁
  case "available": // ✨
  case "owned": // 🎉
}
```

---

## 📝 Exemples de Code

### **Vérifier si un Easter egg peut être claim** :
```typescript
if (item.status === "unlocked") {
  await claimFreeEasterEgg(item.id, account);
  // Passe à status = "owned"
}
```

### **Vérifier si un nombre peut être acheté** :
```typescript
if (item.status === "available" && item.forSale) {
  // Afficher le bouton "Acheter"
}
```

### **Débloquer un Easter egg** :
```typescript
// Gratuit
if (item.isFreeToClaim) {
  item.status = "unlocked"; // Peut être claim
}

// Premium
else {
  item.status = "available"; // Peut être acheté
}
```

---

## 🗄️ Base de Données Supabase

### **Colonne ajoutée** :
```sql
ALTER TABLE numbers 
ADD COLUMN status TEXT 
CHECK (status IN ('locked', 'unlocked', 'available', 'owned'));
```

### **Migration des données existantes** :
Exécutez le fichier `supabase-add-status-column.sql` dans l'éditeur SQL de Supabase pour migrer automatiquement les données existantes.

---

## ✅ Avantages du Système

1. **Simplicité** : Un seul champ au lieu de 3 conditions
2. **Clarté** : État explicite et lisible
3. **Maintenance** : Plus facile à débugger
4. **Performance** : Une seule vérification au lieu de plusieurs
5. **Évolutivité** : Facile d'ajouter de nouveaux états

---

## 🚀 Prochaines Étapes

1. **Exécuter la migration SQL** : `supabase-add-status-column.sql`
2. **Tester en local** : Vérifier que les badges s'affichent correctement
3. **Déployer sur Vercel** : Push les changements
4. **Vérifier en production** : Tester les claims et unlocks

---

## 🐛 Débogage

### **Console logs utiles** :
```typescript
console.log('Current status:', item.status);
console.log('Can claim?', item.status === 'unlocked');
console.log('Can buy?', item.status === 'available');
```

### **Vérifier dans Supabase** :
```sql
SELECT id, label, status, owner, unlocked, is_free_to_claim 
FROM numbers 
WHERE is_easter_egg = true;
```

---

## 📚 Ressources

- **Fichier TypeScript** : `app/page.tsx` (type NumItem)
- **Hook Supabase** : `lib/hooks/useSupabaseData.ts`
- **Schéma DB** : `supabase-schema.sql`
- **Migration** : `supabase-add-status-column.sql`
