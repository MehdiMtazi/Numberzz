import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase, DbNumber, DbSaleContract, DbCertificate, DbInterestedBuyer, isSupabaseConfigured } from '../supabase'

// Types de l'application (correspondant à page.tsx)
export type NumItem = {
  id: string
  label: string
  rarity: 'Ultimate' | 'Legendary' | 'Rare' | 'Uncommon' | 'Common' | 'Exotic'
  priceEth: string
  owner: string | null
  unlocked?: boolean
  description?: string
  forSale?: boolean
  salePrice?: string
  interestedCount?: number
  interestedBy?: string[]
  isEasterEgg?: boolean
  easterEggName?: string
  isFreeToClaim?: boolean
}

export type SaleContract = {
  id: string
  numId: string
  seller: string
  mode: 'buyOffer' | 'fixedPrice'
  priceEth?: string
  buyOffers?: { buyer: string; priceEth: string; timestamp: number }[]
  createdAt: number
  status: 'active' | 'pending' | 'completed' | 'cancelled'
  acceptedOffer?: { buyer: string; priceEth: string; timestamp: number }
  comment?: string
}

export type Cert = {
  id: string
  numId: string
  owner: string
  txHash: string
  issuedAt: string
}

export type InterestedBuyer = {
  address: string
  priceEth: string
  timestamp: number
  comment?: string
}

// Fonction de conversion: DB → App
function dbNumberToNumItem(db: DbNumber): NumItem {
  return {
    id: db.id,
    label: db.label,
    rarity: db.rarity,
    priceEth: db.price_eth,
    owner: db.owner,
    unlocked: db.unlocked,
    description: db.description || undefined,
    forSale: db.for_sale,
    salePrice: db.sale_price || undefined,
    interestedCount: db.interested_count,
    interestedBy: db.interested_by,
    isEasterEgg: db.is_easter_egg,
    easterEggName: db.easter_egg_name || undefined,
    isFreeToClaim: db.is_free_to_claim,
  }
}

// Fonction de conversion: App → DB
function numItemToDbNumber(item: NumItem): Partial<DbNumber> {
  return {
    id: item.id,
    label: item.label,
    rarity: item.rarity,
    price_eth: item.priceEth,
    owner: item.owner,
    unlocked: item.unlocked || false,
    description: item.description || null,
    for_sale: item.forSale || false,
    sale_price: item.salePrice || null,
    interested_count: item.interestedCount || 0,
    interested_by: item.interestedBy || [],
    is_easter_egg: item.isEasterEgg || false,
    easter_egg_name: item.easterEggName || null,
    is_free_to_claim: item.isFreeToClaim || false,
  }
}

/**
 * Hook principal pour gérer les données Supabase avec synchronisation temps réel
 */
export function useSupabaseData(initialNumbers: NumItem[]) {
  const [numbers, setNumbers] = useState<NumItem[]>([])
  const [saleContracts, setSaleContracts] = useState<SaleContract[]>([])
  const [certs, setCerts] = useState<Cert[]>([])
  const [interestedByWithPrice, setInterestedByWithPrice] = useState<Record<string, InterestedBuyer[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ================================
  // Helpers to avoid unnecessary state updates
  // ================================
  const initialNumbersRef = useRef<NumItem[]>([])
  // Keep the first non-empty initialNumbers as seed once to avoid re-init loops
  if (initialNumbersRef.current.length === 0 && initialNumbers && initialNumbers.length > 0) {
    initialNumbersRef.current = initialNumbers
  }

  const shallowEqualArray = <T,>(a: T[], b: T[]) => {
    if (a === b) return true
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  const deepEqual = (a: any, b: any) => {
    try {
      return JSON.stringify(a) === JSON.stringify(b)
    } catch {
      return false
    }
  }

  const setNumbersSafe = useCallback((next: NumItem[]) => {
    setNumbers(prev => (shallowEqualArray(prev, next) ? prev : next))
  }, [])

  const setSaleContractsSafe = useCallback((next: SaleContract[]) => {
    setSaleContracts(prev => (deepEqual(prev, next) ? prev : next))
  }, [])

  const setCertsSafe = useCallback((next: Cert[]) => {
    setCerts(prev => (deepEqual(prev, next) ? prev : next))
  }, [])

  const setInterestedByWithPriceSafe = useCallback((next: Record<string, InterestedBuyer[]>) => {
    setInterestedByWithPrice(prev => (deepEqual(prev, next) ? prev : next))
  }, [])

  // ====================================
  // CHARGEMENT INITIAL
  // ====================================
  
  const loadAllData = useCallback(async () => {
    try {
      setError(null)

      // Skip Supabase calls if not configured (during build)
      if (!isSupabaseConfigured()) {
        console.warn('⚠️ Supabase not configured, using initial data only')
        if (initialNumbersRef.current && initialNumbersRef.current.length > 0) {
          setNumbersSafe(initialNumbersRef.current)
        }
        setLoading(false)
        return
      }

      // Charger les numbers
      const { data: numbersData, error: numbersError } = await supabase
        .from('numbers')
        .select('*')
        .order('id', { ascending: true })

      if (numbersError) throw numbersError

      // Si la DB est vide, initialiser avec les données par défaut
      if (!numbersData || numbersData.length === 0) {
        if (initialNumbersRef.current && initialNumbersRef.current.length > 0) {
          console.log('🚀 Base de données vide - Initialisation avec les données par défaut...')
          await initializeNumbers(initialNumbersRef.current)
          setNumbersSafe(initialNumbersRef.current)
        } else {
          setNumbersSafe([])
        }
      } else {
        setNumbersSafe(numbersData.map(dbNumberToNumItem))
      }

      // Charger les sale contracts
      const { data: contractsData, error: contractsError } = await supabase
        .from('sale_contracts')
        .select('*')
        .order('created_at', { ascending: false })

      if (contractsError) throw contractsError
      
      // Convertir les contrats DB vers format app (simplifié pour l'instant)
      const contracts: SaleContract[] = (contractsData || []).map((c: DbSaleContract) => ({
        id: c.id,
        numId: c.num_id,
        seller: c.seller,
        mode: c.mode,
        priceEth: c.price_eth || undefined,
        buyOffers: [],
        createdAt: c.created_at,
        status: c.status,
        comment: c.comment || undefined,
      }))
      setSaleContractsSafe(contracts)

      // Charger les certificates
      const { data: certsData, error: certsError } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false })

      if (certsError) throw certsError
      
      const certificates: Cert[] = (certsData || []).map((c: DbCertificate) => ({
        id: c.id,
        numId: c.num_id,
        owner: c.owner,
        txHash: c.tx_hash,
        issuedAt: c.issued_at,
      }))
      setCertsSafe(certificates)

      // Charger les interested buyers
      const { data: interestedData, error: interestedError } = await supabase
        .from('interested_buyers')
        .select('*')
        .order('timestamp', { ascending: false })

      if (interestedError) throw interestedError

      // Grouper par num_id
      const interestedMap: Record<string, InterestedBuyer[]> = {}
      ;(interestedData || []).forEach((buyer: DbInterestedBuyer) => {
        if (!interestedMap[buyer.num_id]) {
          interestedMap[buyer.num_id] = []
        }
        interestedMap[buyer.num_id].push({
          address: buyer.address,
          priceEth: buyer.price_eth,
          timestamp: buyer.timestamp,
          comment: buyer.comment || undefined,
        })
      })
      setInterestedByWithPriceSafe(interestedMap)

      console.log('✅ Données chargées depuis Supabase')
    } catch (err: any) {
      console.error('❌ Erreur lors du chargement:', err?.message ?? err)
      setError(err?.message ?? String(err))
      // En cas d'erreur, utiliser les données initiales
      if (initialNumbersRef.current && initialNumbersRef.current.length > 0) {
        setNumbersSafe(initialNumbersRef.current)
      }
    } finally {
      setLoading(false)
    }
  }, [setNumbersSafe, setSaleContractsSafe, setCertsSafe, setInterestedByWithPriceSafe])

  // ====================================
  // INITIALISATION DE LA DB
  // ====================================
  
  const initializeNumbers = useCallback(async (items: NumItem[]) => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping initialization')
      return
    }
    try {
      if (!items || items.length === 0) return
      const dbNumbers = items.map(numItemToDbNumber)
      const { error } = await supabase
        .from('numbers')
        .upsert(dbNumbers, { onConflict: 'id' })

      if (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error)
        throw error
      } else {
        console.log(`✅ ${items.length} nombres initialisés dans Supabase`)
      }
    } catch (err) {
      console.error('❌ Erreur d\'initialisation:', err)
    }
  }, [])

  // ====================================
  // SUBSCRIPTIONS TEMPS RÉEL - OPTIMISÉ (Updates Incrémentiels)
  // ====================================
  
  useEffect(() => {
    // Initial load
    setLoading(true)
    loadAllData()

    // Skip realtime subscriptions if Supabase not configured
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, realtime disabled')
      return
    }

    // 🚀 OPTIMISATION: Mise à jour incrémentale pour NUMBERS
    const numbersChannel = supabase
      .channel('numbers_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'numbers' }, 
        (payload: any) => {
          console.log('➕ Nouveau nombre ajouté:', payload.new.id)
          const newNumber = dbNumberToNumItem(payload.new as DbNumber)
          setNumbers(prev => {
            // Vérifier si pas déjà présent
            if (prev.some(n => n.id === newNumber.id)) return prev
            return [...prev, newNumber]
          })
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'numbers' }, 
        (payload: any) => {
          console.log('🔄 Nombre modifié:', payload.new.id)
          const updatedNumber = dbNumberToNumItem(payload.new as DbNumber)
          setNumbers(prev => prev.map(n => 
            n.id === updatedNumber.id ? updatedNumber : n
          ))
        }
      )
      .on('postgres_changes', 
        { event: 'DELETE', schema: 'public', table: 'numbers' }, 
        (payload: any) => {
          console.log('🗑️ Nombre supprimé:', payload.old.id)
          setNumbers(prev => prev.filter(n => n.id !== payload.old.id))
        }
      )
      .subscribe()

    // 🚀 OPTIMISATION: Mise à jour incrémentale pour CONTRACTS
    const contractsChannel = supabase
      .channel('contracts_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'sale_contracts' }, 
        (payload: any) => {
          console.log('➕ Nouveau contrat ajouté:', payload.new.id)
          const newContract: SaleContract = {
            id: payload.new.id,
            numId: payload.new.num_id,
            seller: payload.new.seller,
            mode: payload.new.mode,
            priceEth: payload.new.price_eth || undefined,
            buyOffers: [],
            createdAt: payload.new.created_at,
            status: payload.new.status,
            comment: payload.new.comment || undefined,
          }
          setSaleContracts(prev => {
            if (prev.some(c => c.id === newContract.id)) return prev
            return [newContract, ...prev]
          })
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'sale_contracts' }, 
        (payload: any) => {
          console.log('🔄 Contrat modifié:', payload.new.id)
          const updated: SaleContract = {
            id: payload.new.id,
            numId: payload.new.num_id,
            seller: payload.new.seller,
            mode: payload.new.mode,
            priceEth: payload.new.price_eth || undefined,
            buyOffers: [],
            createdAt: payload.new.created_at,
            status: payload.new.status,
            comment: payload.new.comment || undefined,
          }
          setSaleContracts(prev => prev.map(c => c.id === updated.id ? updated : c))
        }
      )
      .on('postgres_changes', 
        { event: 'DELETE', schema: 'public', table: 'sale_contracts' }, 
        (payload: any) => {
          console.log('🗑️ Contrat supprimé:', payload.old.id)
          setSaleContracts(prev => prev.filter(c => c.id !== payload.old.id))
        }
      )
      .subscribe()

    // 🚀 OPTIMISATION: Mise à jour incrémentale pour CERTIFICATES
    const certsChannel = supabase
      .channel('certs_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'certificates' }, 
        (payload: any) => {
          console.log('➕ Nouveau certificat ajouté:', payload.new.id)
          const newCert: Cert = {
            id: payload.new.id,
            numId: payload.new.num_id,
            owner: payload.new.owner,
            txHash: payload.new.tx_hash,
            issuedAt: payload.new.issued_at,
          }
          setCerts(prev => {
            if (prev.some(c => c.id === newCert.id)) return prev
            return [newCert, ...prev]
          })
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'certificates' }, 
        (payload: any) => {
          console.log('🔄 Certificat modifié:', payload.new.id)
          const updated: Cert = {
            id: payload.new.id,
            numId: payload.new.num_id,
            owner: payload.new.owner,
            txHash: payload.new.tx_hash,
            issuedAt: payload.new.issued_at,
          }
          setCerts(prev => prev.map(c => c.id === updated.id ? updated : c))
        }
      )
      .on('postgres_changes', 
        { event: 'DELETE', schema: 'public', table: 'certificates' }, 
        (payload: any) => {
          console.log('🗑️ Certificat supprimé:', payload.old.id)
          setCerts(prev => prev.filter(c => c.id !== payload.old.id))
        }
      )
      .subscribe()

    // 🚀 OPTIMISATION: Mise à jour incrémentale pour INTERESTED_BUYERS
    const interestedChannel = supabase
      .channel('interested_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'interested_buyers' }, 
        (payload: any) => {
          console.log('➕ Nouvel intéressé ajouté:', payload.new.address)
          const buyer: InterestedBuyer = {
            address: payload.new.address,
            priceEth: payload.new.price_eth,
            timestamp: payload.new.timestamp,
            comment: payload.new.comment || undefined,
          }
          setInterestedByWithPrice(prev => {
            const numId = payload.new.num_id
            const existing = prev[numId] || []
            // Vérifier si pas déjà présent
            if (existing.some(b => b.address === buyer.address && b.timestamp === buyer.timestamp)) {
              return prev
            }
            return { ...prev, [numId]: [...existing, buyer] }
          })
        }
      )
      .on('postgres_changes', 
        { event: 'DELETE', schema: 'public', table: 'interested_buyers' }, 
        (payload: any) => {
          console.log('🗑️ Intéressé supprimé:', payload.old.address)
          setInterestedByWithPrice(prev => {
            const numId = payload.old.num_id
            const existing = prev[numId] || []
            const filtered = existing.filter(b => 
              !(b.address === payload.old.address && b.timestamp === payload.old.timestamp)
            )
            if (filtered.length === 0) {
              const { [numId]: _, ...rest } = prev
              return rest
            }
            return { ...prev, [numId]: filtered }
          })
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(numbersChannel)
      supabase.removeChannel(contractsChannel)
      supabase.removeChannel(certsChannel)
      supabase.removeChannel(interestedChannel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ====================================
  // FONCTIONS DE SAUVEGARDE
  // ====================================
  
  // ====================================
  // LOGIQUE MÉTIER: CLAIM/UNLOCK (ATOMIQUE)
  // ====================================

  // Claim d'un Easter Egg gratuit: première personne seulement
  // Contrat:
  // - Input: numId, claimer address
  // - Effet: SET owner=claimer, unlocked=true, is_free_to_claim=false WHERE id=numId AND owner IS NULL AND is_free_to_claim = true
  // - Retour: { ok: boolean, updated?: NumItem, reason?: 'already_claimed' | 'not_free' | 'not_found' | 'error' }
  const claimFreeEasterEgg = useCallback(async (numId: string, claimer: string): Promise<{ ok: boolean; updated?: NumItem; reason?: string }> => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured')
      return { ok: false, reason: 'not_configured' }
    }
    try {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('numbers')
        .update({ owner: claimer, unlocked: true, is_free_to_claim: false, updated_at: now })
        .eq('id', numId)
        .is('owner', null)
        .eq('is_free_to_claim', true)
        .select('*')
        .maybeSingle()

      if (error) throw error

      if (!data) {
        // Soit déjà claim, soit pas free
        // Vérifier l'état actuel pour préciser la raison
        const { data: cur } = await supabase.from('numbers').select('owner,is_free_to_claim').eq('id', numId).maybeSingle()
        if (!cur) return { ok: false, reason: 'not_found' }
        if (cur.owner) return { ok: false, reason: 'already_claimed' }
        if (cur.is_free_to_claim === false) return { ok: false, reason: 'not_free' }
        return { ok: false, reason: 'already_claimed' }
      }

      const updated = dbNumberToNumItem(data as DbNumber)
      // Patch local state rapidement (le realtime mettra aussi à jour)
      setNumbers(prev => prev.map(n => (n.id === numId ? updated : n)))
      return { ok: true, updated }
    } catch (err) {
      console.error('❌ Erreur claimFreeEasterEgg:', err)
      return { ok: false, reason: 'error' }
    }
  }, [])

  // Déverrouillage global (ne change pas l'owner)
  const unlockNumber = useCallback(async (numId: string): Promise<{ ok: boolean }> => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured')
      return { ok: false }
    }
    try {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('numbers')
        .update({ unlocked: true, updated_at: now })
        .eq('id', numId)
        .eq('unlocked', false)
        .select('id')

      if (error) throw error
      if (data && data.length > 0) {
        setNumbers(prev => prev.map(n => (n.id === numId ? { ...n, unlocked: true } : n)))
      }
      return { ok: true }
    } catch (err) {
      console.error('❌ Erreur unlockNumber:', err)
      return { ok: false }
    }
  }, [])

  // Recalcule et synchronise le compteur d'intéressés pour un numéro
  const syncInterestedCount = useCallback(async (numId: string) => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured')
      return
    }
    try {
      const { count, error } = await supabase
        .from('interested_buyers')
        .select('*', { count: 'exact', head: true })
        .eq('num_id', numId)

      if (error) throw error
      const newCount = count || 0
      const now = new Date().toISOString()
      const { error: upErr } = await supabase
        .from('numbers')
        .update({ interested_count: newCount, updated_at: now })
        .eq('id', numId)

      if (upErr) throw upErr
      setNumbers(prev => prev.map(n => (n.id === numId ? { ...n, interestedCount: newCount } : n)))
    } catch (err) {
      console.error('❌ Erreur syncInterestedCount:', err)
    }
  }, [])

  const saveNumber = useCallback(async (number: NumItem) => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping save')
      return
    }
    try {
      const dbNumber = numItemToDbNumber(number)
      const { error } = await supabase
        .from('numbers')
        .upsert(dbNumber, { onConflict: 'id' })

      if (error) {
        console.error('❌ Erreur lors de la sauvegarde du nombre:', error)
        throw error
      }
      console.log(`✅ Nombre ${number.id} sauvegardé`)
    } catch (err) {
      console.error('❌ Erreur saveNumber:', err)
    }
  }, [])

  const saveSaleContract = useCallback(async (contract: SaleContract) => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping save')
      return
    }
    try {
      const dbContract: Partial<DbSaleContract> = {
        id: contract.id,
        num_id: contract.numId,
        seller: contract.seller,
        mode: contract.mode,
        price_eth: contract.priceEth || null,
        created_at: contract.createdAt,
        status: contract.status,
        comment: contract.comment || null,
      }
      const { error } = await supabase
        .from('sale_contracts')
        .upsert(dbContract, { onConflict: 'id' })

      if (error) {
        console.error('❌ Erreur lors de la sauvegarde du contrat:', error)
        throw error
      }
      console.log(`✅ Contrat ${contract.id} sauvegardé`)
    } catch (err) {
      console.error('❌ Erreur saveSaleContract:', err)
    }
  }, [])

  const saveCertificate = useCallback(async (cert: Cert) => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping save')
      return
    }
    try {
      const dbCert: Partial<DbCertificate> = {
        id: cert.id,
        num_id: cert.numId,
        owner: cert.owner,
        tx_hash: cert.txHash,
        issued_at: cert.issuedAt,
      }
      const { error } = await supabase
        .from('certificates')
        .insert(dbCert)

      if (error) {
        console.error('❌ Erreur lors de la sauvegarde du certificat:', error)
        throw error
      }
      console.log(`✅ Certificat ${cert.id} sauvegardé`)
    } catch (err) {
      console.error('❌ Erreur saveCertificate:', err)
    }
  }, [])

  const saveInterestedBuyer = useCallback(async (numId: string, buyer: InterestedBuyer) => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping save')
      return
    }
    try {
      const dbBuyer: Partial<DbInterestedBuyer> = {
        num_id: numId,
        address: buyer.address,
        price_eth: buyer.priceEth,
        timestamp: buyer.timestamp,
        comment: buyer.comment || null,
      }
      const { error } = await supabase
        .from('interested_buyers')
        .upsert(dbBuyer, { onConflict: 'num_id,address' })

      if (error) {
        console.error('❌ Erreur lors de la sauvegarde de l\'intéressé:', error)
        throw error
      }
      console.log(`✅ Intéressé sauvegardé pour ${numId}`)
    } catch (err) {
      console.error('❌ Erreur saveInterestedBuyer:', err)
    }
  }, [])

  const removeInterestedBuyer = useCallback(async (numId: string, address: string) => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping delete')
      return
    }
    try {
      const { error } = await supabase
        .from('interested_buyers')
        .delete()
        .eq('num_id', numId)
        .eq('address', address)

      if (error) {
        console.error('❌ Erreur lors de la suppression de l\'intéressé:', error)
        throw error
      }
      console.log(`✅ Intéressé supprimé pour ${numId}`)
    } catch (err) {
      console.error('❌ Erreur removeInterestedBuyer:', err)
    }
  }, [])

  const deleteSaleContract = useCallback(async (contractId: string) => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping delete')
      return
    }
    try {
      const { error } = await supabase
        .from('sale_contracts')
        .delete()
        .eq('id', contractId)

      if (error) {
        console.error('❌ Erreur lors de la suppression du contrat:', error)
        throw error
      }
      console.log(`✅ Contrat ${contractId} supprimé`)
    } catch (err) {
      console.error('❌ Erreur deleteSaleContract:', err)
    }
  }, [])

  // ====================================
  // FONCTION DE RÉINITIALISATION COMPLÈTE
  // ====================================
  
  const clearAllData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping clear')
      return
    }
    try {
      // Supprimer toutes les données
      await supabase.from('interested_buyers').delete().neq('id', 0)
      await supabase.from('certificates').delete().neq('id', 'none')
      await supabase.from('sale_contracts').delete().neq('id', 'none')
      await supabase.from('numbers').delete().neq('id', 'none')

      // Réinitialiser avec les données initiales
      await initializeNumbers(initialNumbers)

      console.log('🗑️ Toutes les données ont été réinitialisées')
      await loadAllData()
    } catch (err) {
      console.error('❌ Erreur clearAllData:', err)
    }
  }, [initialNumbers, loadAllData])

  // ====================================
  // BATCH OPERATIONS (OPTIMISATION)
  // ====================================
  
  // 🚀 Sauvegarder plusieurs nombres en une seule requête
  const saveNumbersBatch = useCallback(async (numbers: NumItem[]) => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping batch save')
      return
    }
    try {
      if (numbers.length === 0) return
      const dbNumbers = numbers.map(numItemToDbNumber)
      const { error } = await supabase
        .from('numbers')
        .upsert(dbNumbers, { onConflict: 'id' })

      if (error) {
        console.error('❌ Erreur lors de la sauvegarde batch:', error)
        throw error
      }
      console.log(`✅ ${numbers.length} nombres sauvegardés en batch`)
    } catch (err) {
      console.error('❌ Erreur saveNumbersBatch:', err)
      throw err
    }
  }, [])

  // 🚀 Sauvegarder plusieurs contrats en une seule requête
  const saveContractsBatch = useCallback(async (contracts: SaleContract[]) => {
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured, skipping batch save')
      return
    }
    try {
      if (contracts.length === 0) return
      const dbContracts = contracts.map(c => ({
        id: c.id,
        num_id: c.numId,
        seller: c.seller,
        mode: c.mode,
        price_eth: c.priceEth || null,
        created_at: c.createdAt,
        status: c.status,
        comment: c.comment || null,
      }))
      const { error } = await supabase
        .from('sale_contracts')
        .upsert(dbContracts, { onConflict: 'id' })

      if (error) {
        console.error('❌ Erreur lors de la sauvegarde batch contrats:', error)
        throw error
      }
      console.log(`✅ ${contracts.length} contrats sauvegardés en batch`)
    } catch (err) {
      console.error('❌ Erreur saveContractsBatch:', err)
      throw err
    }
  }, [])

  return {
    numbers,
    setNumbers,
    saleContracts,
    setSaleContracts,
    certs,
    setCerts,
    interestedByWithPrice,
    setInterestedByWithPrice,
    loading,
    error,
    claimFreeEasterEgg,
    unlockNumber,
    syncInterestedCount,
    saveNumber,
    saveSaleContract,
    saveCertificate,
    saveInterestedBuyer,
    removeInterestedBuyer,
    deleteSaleContract,
    clearAllData,
    // Batch operations pour optimisation
    saveNumbersBatch,
    saveContractsBatch,
  }
}
