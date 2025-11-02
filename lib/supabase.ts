import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 🚀 Configuration optimisée pour les performances
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Limite les événements pour éviter la surcharge
    },
  },
  global: {
    headers: {
      'x-client-info': 'numberzz-app',
    },
  },
})

// Types pour la base de données
export type DbNumber = {
  id: string
  label: string
  rarity: 'Ultimate' | 'Legendary' | 'Rare' | 'Uncommon' | 'Common' | 'Exotic'
  price_eth: string
  owner: string | null
  unlocked: boolean
  description: string | null
  for_sale: boolean
  sale_price: string | null
  interested_count: number
  interested_by: string[]
  is_easter_egg: boolean
  easter_egg_name: string | null
  is_free_to_claim: boolean
  updated_at: string
}

export type DbSaleContract = {
  id: string
  num_id: string
  seller: string
  mode: 'buyOffer' | 'fixedPrice'
  price_eth: string | null
  created_at: number
  status: 'active' | 'pending' | 'completed' | 'cancelled'
  comment: string | null
  updated_at: string
}

export type DbCertificate = {
  id: string
  num_id: string
  owner: string
  tx_hash: string
  issued_at: string
  updated_at: string
}

export type DbInterestedBuyer = {
  id: number
  num_id: string
  address: string
  price_eth: string
  timestamp: number
  comment: string | null
  updated_at: string
}
