"use client"
// @ts-ignore - allow compilation when @types/react isn't resolved in the environment
import { useEffect, useState, useRef, useCallback } from "react";
import { sdk } from '@farcaster/miniapp-sdk';

// Hook to prevent SSR/Client hydration errors

const useHydrated = () => {
	const [hydrated, setHydrated] = useState(false);
	useEffect(() => {
		setHydrated(true);
	}, []);
	return hydrated;
};

// local fallback to satisfy TS for JSX intrinsic elements when react types aren't available
declare global {
	namespace JSX {
		interface IntrinsicElements {
			[elemName: string]: any;
		}
	}
}

// ============================================
// CROSS-TAB SYNCHRONIZATION
// ============================================
type SyncMessage = {
	type: "numbersUpdate" | "contractsUpdate" | "certsUpdate" | "interestedUpdate";
	payload: any;
};

const useCrossTabSync = () => {
	const channelRef = useRef<BroadcastChannel | null>(null);

	useEffect(() => {
		// Initialize BroadcastChannel for cross-tab synchronization
		if (typeof window !== "undefined" && "BroadcastChannel" in window) {
			channelRef.current = new (window as any).BroadcastChannel("numberz_sync");

			// Listen for messages from other tabs and save to localStorage
			if (channelRef.current) {
				channelRef.current.onmessage = (event: MessageEvent<SyncMessage>) => {
					const { type, payload } = event.data;
					if (type === "numbersUpdate") {
						localStorage.setItem("numberz_numbers", JSON.stringify(payload));
					} else if (type === "contractsUpdate") {
						localStorage.setItem("numberz_contracts", JSON.stringify(payload));
					} else if (type === "certsUpdate") {
						localStorage.setItem("numberz_certs", JSON.stringify(payload));
					} else if (type === "interestedUpdate") {
						localStorage.setItem("numberz_interested", JSON.stringify(payload));
					}
				};
			}
		}

		return () => {
			if (channelRef.current) {
				channelRef.current.close();
			}
		};
	}, []);

	const broadcastNumbers = (numbers: any[]) => {
		if (channelRef.current) {
			channelRef.current.postMessage({
				type: "numbersUpdate",
				payload: numbers,
			});
		}
	};

	const broadcastContracts = (contracts: any[]) => {
		if (channelRef.current) {
			channelRef.current.postMessage({
				type: "contractsUpdate",
				payload: contracts,
			});
		}
	};

	const broadcastCerts = (certs: any[]) => {
		if (channelRef.current) {
			channelRef.current.postMessage({
				type: "certsUpdate",
				payload: certs,
			});
		}
	};

	const broadcastInterested = (interested: Record<string, any[]>) => {
		if (channelRef.current) {
			channelRef.current.postMessage({
				type: "interestedUpdate",
				payload: interested,
			});
		}
	};

	return {
		broadcastNumbers,
		broadcastContracts,
		broadcastCerts,
		broadcastInterested,
	};
};

export default function Home() {
	useEffect(() => {
		// Keep the call to the mini app SDK: some environments (dev browser
		// outside mini app) do not expose actions and may throw errors.
		try {
			if (sdk && sdk.actions && typeof sdk.actions.ready === 'function') {
				sdk.actions.ready();
			}
		} catch (err) {
			// Don't break the UI if the SDK is not available
			console.warn('miniapp sdk.actions.ready() failed or not available', err);
		}
	}, []);
	// Prevent SSR/Client hydration errors
	const hydrated = useHydrated();
	
	// Cross-tab synchronization
	const sync = useCrossTabSync();

	// Wallet & app state
	const [account, setAccount] = useState<string | null>(null);
	const [showWalletModal, setShowWalletModal] = useState(false);
	const [networkCorrect, setNetworkCorrect] = useState(false);
	const [currentChainId, setCurrentChainId] = useState<string | null>(null);
	const bankWalletAddress = "0x9756bdA6091a492C4b9d441beD25971A198D82Bc"; // Adresse admin de l'app
	const BASE_CHAIN_ID = "0x2105"; // Base Mainnet (8453)

	type NumItem = {
		id: string;
		label: string;
		rarity: "Ultimate" | "Legendary" | "Rare" | "Uncommon" | "Common" | "Exotic";
		priceEth: string;
		owner: string | null;
		unlocked?: boolean; // pour les easter eggs: déverrouillé ou non
		description?: string;
		// Champs optionnels utilisés dans l'app
		forSale?: boolean;
		salePrice?: string; // prix en ETH/Base sous forme string
		interestedCount?: number;
		interestedBy?: string[];
		isEasterEgg?: boolean;
		easterEggName?: string;
		isFreeToClaim?: boolean;
	};

	type Achievement = {
		id: string;
		name: string;
		description: string;
		icon: string;
		unlocked: boolean;
		unlockedAt?: number;
	};

	// New: search and automatic generation of natural integers
	const [query, setQuery] = useState<string>("");
	const [searchOpen, setSearchOpen] = useState<boolean>(false);

	// Pagination
	const [currentPage, setCurrentPage] = useState<number>(1);
	const itemsPerPage = 20;

	// Scroll tracking pour le bouton flottant
	const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

	// Comptages pour actions nécessaires au déblocage des easter eggs
	const [logoClickCount, setLogoClickCount] = useState<number>(0);
	const [searchIconClickCount, setSearchIconClickCount] = useState<number>(0);
	
	// Menu mobile pour mini app
	const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
	
	// Filtres
	const [filterType, setFilterType] = useState<"all" | "available" | "ownedByMe" | "ownedByOthers" | "forSale">("all");
	const [sortBy, setSortBy] = useState<"none" | "priceAsc" | "priceDesc" | "rarity" | "mostInterested">("rarity");
	
	// Achievements
	const [achievements, setAchievements] = useState<Achievement[]>([]);
	const [showAchievementModal, setShowAchievementModal] = useState(false);
	const [lastAchievement, setLastAchievement] = useState<Achievement | null>(null);

	// Determine rarity and price based on the number
	const getNumberRarity = (num: number): { rarity: "Legendary" | "Rare" | "Uncommon" | "Common"; price: string } => {
		// Prime numbers = Rare
		const isPrime = (n: number) => {
			if (n <= 1) return false;
			if (n <= 3) return true;
			if (n % 2 === 0 || n % 3 === 0) return false;
			for (let i = 5; i * i <= n; i += 6) {
				if (n % i === 0 || n % (i + 2) === 0) return false;
			}
			return true;
		};
		
		// Perfect numbers or powers = Uncommon
		const isPerfect = (n: number) => n === 6 || n === 28 || n === 496;
		const isPowerOf = (n: number) => {
			for (let base = 2; base < n; base++) {
				let power = base;
				while (power < n) power *= base;
				if (power === n) return true;
			}
			return false;
		};

		// Fibonacci numbers = Uncommon
		const isFibonacci = (n: number) => {
			let a = 0, b = 1;
			while (a < n) [a, b] = [b, a + b];
			return a === n;
		};

		if (isPrime(num)) {
			return { rarity: "Rare", price: "0.003" };
		} else if (isPerfect(num) || isPowerOf(num) || isFibonacci(num)) {
			return { rarity: "Uncommon", price: "0.0015" };
		} else {
			return { rarity: "Common", price: "0.0006" };
		}
	};

	const generateNaturals = (start: number, end: number): NumItem[] => {
		// Special numbers already defined in initialNumbers - to exclude
		const excludedNumbers = new Set([0, 1, 42, 69, 420, 666, 1337, 1729, 256, 512]);
		
		const out: NumItem[] = [];
		for (let i = start; i <= end; i++) {
			// Ignore special numbers
			if (excludedNumbers.has(i)) continue;
			
			const { rarity, price } = getNumberRarity(i);
			
			// Generate contextual description
			let description = `Unique number ${i} - `;
			if (i === 2) description += "The first prime number";
			else if (getNumberRarity(i).rarity === "Rare") description += "Prime number - Rare mathematical property";
			else if (getNumberRarity(i).rarity === "Uncommon") description += "Special number with mathematical properties";
			else description += "Natural integer number";
			
			out.push({ id: String(i), label: String(i), rarity, priceEth: price, owner: null, description, interestedCount: 0, interestedBy: [] });
		}
		return out;
	};

	const initialNumbers: NumItem[] = [
		// === ULTIMATE ===
		{ id: "infinity", label: "∞", rarity: "Ultimate", priceEth: "0.05", owner: null, description: "🌟 INFINITY - The Ultimate Number: Beyond all limits, transcending reality itself. The most precious number in existence.", interestedCount: 0, interestedBy: [] },

		// === LEGENDARY ===
		{ id: "pi", label: "π", rarity: "Legendary", priceEth: "0.02", owner: null, description: "Pi - Famous irrational number (3.14159...)", interestedCount: 0, interestedBy: [] },
		{ id: "e", label: "e", rarity: "Legendary", priceEth: "0.0189", owner: null, description: "e - Euler's constant (2.71828...)", interestedCount: 0, interestedBy: [] },
		{ id: "phi", label: "φ", rarity: "Legendary", priceEth: "0.0177", owner: null, description: "Phi - The golden ratio (1.618...)", interestedCount: 0, interestedBy: [] },
		{ id: "gamma", label: "γ", rarity: "Legendary", priceEth: "0.0169", owner: null, description: "Gamma - Euler-Mascheroni constant (0.5772...)", interestedCount: 0, interestedBy: [] },
		{ id: "tau", label: "τ", rarity: "Legendary", priceEth: "0.0195", owner: null, description: "Tau - Circle constant (6.28318...)", interestedCount: 0, interestedBy: [] },
		{ id: "sqrt2", label: "√2", rarity: "Legendary", priceEth: "0.0175", owner: null, description: "Square root of 2 - First irrational constant (1.414...)", interestedCount: 0, interestedBy: [] },
		{ id: "omega", label: "Ω", rarity: "Legendary", priceEth: "0.0183", owner: null, description: "Omega - Chaitin's constant (0.00787...)", interestedCount: 0, interestedBy: [] },
		{ id: "sqrt3", label: "√3", rarity: "Legendary", priceEth: "0.0173", owner: null, description: "Square root of 3 - Irrational constant (1.732...)", interestedCount: 0, interestedBy: [] },
		{ id: "ln2", label: "ln(2)", rarity: "Legendary", priceEth: "0.0165", owner: null, description: "Natural logarithm of 2 (0.693...)", interestedCount: 0, interestedBy: [] },
		{ id: "apery", label: "ζ(3)", rarity: "Legendary", priceEth: "0.0181", owner: null, description: "Apéry's constant - Zeta of 3 (1.202...)", interestedCount: 0, interestedBy: [] },

		// === RARE ===
		{ id: "zero", label: "0", rarity: "Rare", priceEth: "0.005", owner: null, description: "The number zero - Fundamental in mathematics", interestedCount: 0, interestedBy: [] },
		{ id: "one", label: "1", rarity: "Rare", priceEth: "0.0048", owner: null, description: "The unit - Base of all integers", interestedCount: 0, interestedBy: [] },
		{ id: "42", label: "42", rarity: "Rare", priceEth: "0.0044", owner: null, description: "The answer to life, the universe and everything - Hitchhiker's Guide reference", interestedCount: 0, interestedBy: [] },
		{ id: "1337", label: "1337", rarity: "Rare", priceEth: "0.004", owner: null, description: "Leet speak - Symbol of Internet culture", interestedCount: 0, interestedBy: [] },
		{ id: "69", label: "69", rarity: "Rare", priceEth: "0.0038", owner: null, description: "The meme number - Balance and symmetry", interestedCount: 0, interestedBy: [] },
		{ id: "420", label: "420", rarity: "Rare", priceEth: "0.0042", owner: null, description: "The wellness hour - Iconic pop culture", interestedCount: 0, interestedBy: [] },
		{ id: "666", label: "666", rarity: "Rare", priceEth: "0.0046", owner: null, description: "The mysterious number - Fascinating and enigmatic", interestedCount: 0, interestedBy: [] },
		{ id: "1729", label: "1729", rarity: "Rare", priceEth: "0.0051", owner: null, description: "Ramanujan number - Smallest number expressible as sum of two cubes in two ways", interestedCount: 0, interestedBy: [] },
		{ id: "256", label: "256", rarity: "Rare", priceEth: "0.0036", owner: null, description: "2^8 - Fundamental power in computer science", interestedCount: 0, interestedBy: [] },
		{ id: "512", label: "512", rarity: "Rare", priceEth: "0.0038", owner: null, description: "2^9 - Classic limit of systems", interestedCount: 0, interestedBy: [] },

		// === EXOTIC (EASTER EGGS) ===
		// FREE TO CLAIM (directly in My Numbers)
		{ id: "d_darius", label: "Ð", rarity: "Exotic", priceEth: "0", owner: null, unlocked: false, description: "🗡️ Darius Coin - The man with the gigantotitan arm! Found by searching 'darius'", interestedCount: 0, interestedBy: [], isEasterEgg: true, easterEggName: "darius", isFreeToClaim: true },
		{ id: "n_nyan", label: "🌈", rarity: "Exotic", priceEth: "0", owner: null, unlocked: false, description: "🐈 Nyan Cat Coin - The legendary rainbow cat! Found by searching 'nyan'", interestedCount: 0, interestedBy: [], isEasterEgg: true, easterEggName: "nyan", isFreeToClaim: true },
		{ id: "c_chroma", label: "◆", rarity: "Exotic", priceEth: "0", owner: null, unlocked: false, description: "🌈 Chroma Coin - Click the logo 7 times to get it!", interestedCount: 0, interestedBy: [], isEasterEgg: true, easterEggName: "chroma", isFreeToClaim: true },

		// PREMIUM (Available for purchase after unlocking)
		{ id: "w_wukong", label: "☯", rarity: "Exotic", priceEth: "0.05", owner: null, unlocked: false, description: "🐵 Monkey King Coin - The king of monkeys! Unlocked by searching 'wukong', now available for purchase", interestedCount: 0, interestedBy: [], isEasterEgg: true, easterEggName: "wukong", isFreeToClaim: false },
		{ id: "h_halflife", label: "½", rarity: "Exotic", priceEth: "0.048", owner: null, unlocked: false, description: "🎮 Half-Life Coin - Half-Life 3 confirmed? Unlocked by searching 'half-life'", interestedCount: 0, interestedBy: [], isEasterEgg: true, easterEggName: "half-life", isFreeToClaim: false },
		{ id: "m_meme", label: "🎲", rarity: "Exotic", priceEth: "0.042", owner: null, unlocked: false, description: "Meme Coin - Amazing! Unlocked by searching 'meme'", interestedCount: 0, interestedBy: [], isEasterEgg: true, easterEggName: "meme", isFreeToClaim: false },
		{ id: "s_secret", label: "🔐", rarity: "Exotic", priceEth: "0.035", owner: null, unlocked: false, description: "Secret Coin - Mysterious! Unlocked by clicking the Search button 10 times", interestedCount: 0, interestedBy: [], isEasterEgg: true, easterEggName: "secret", isFreeToClaim: false },

		...generateNaturals(2, 300),
	];

	// Initialize states with synchronized data or default values
	const [numbers, setNumbers] = useState<NumItem[]>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("numberz_numbers");
			if (saved) {
				try {
					const parsed = JSON.parse(saved);
					// Vérifier que c'est un array valide
					if (Array.isArray(parsed) && parsed.length > 0) {
						return parsed;
					}
				} catch (e) {
					console.error("Error parsing localStorage numbers:", e);
					// Vider la clé corrompue
					localStorage.removeItem("numberz_numbers");
				}
			}
		}
		return initialNumbers;
	});
	
	// Synchroniser les changements de numbers vers les autres onglets ET localStorage
	useEffect(() => {
		if (numbers.length > 0) {
			try {
				localStorage.setItem("numberz_numbers", JSON.stringify(numbers));
			sync.broadcastNumbers(numbers);
		} catch (e) {
			console.error("Error saving numbers:", e);
			// If localStorage is full, clear cache and retry
			try {
				localStorage.clear();
				localStorage.setItem("numberz_numbers", JSON.stringify(numbers));
			} catch (e2) {
				console.error("Unable to save even after clear:", e2);
			}
		}
	}
}, [numbers]);

// New: selected item for detailed card (modal)
const [selected, setSelected] = useState<NumItem | null>(null);

// New: trade UI state
const [tradeMode, setTradeMode] = useState(false);
const [tradeAddress, setTradeAddress] = useState("");	type Cert = { id: string; numId: string; owner: string; txHash: string; issuedAt: string };
	const [certs, setCerts] = useState<Cert[]>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("numberz_certs");
			if (saved) {
				try {
					return JSON.parse(saved);
				} catch (e) {
					console.error("Error parsing localStorage certs:", e);
				}
			}
		}
		return [];
	});

	// Synchronize changes of certs to other tabs AND localStorage
	useEffect(() => {
		try {
			localStorage.setItem("numberz_certs", JSON.stringify(certs));
			sync.broadcastCerts(certs);
		} catch (e) {
			console.error("Error saving certs:", e);
		}
	}, [certs]);

	// Types for sale smart contracts
	type SaleContract = {
		id: string;
		numId: string;
		seller: string;
		mode: "buyOffer" | "fixedPrice"; // buyOffer = seller waits for offer, fixedPrice = price set by seller
		priceEth?: string; // only for fixedPrice
		buyOffers?: { buyer: string; priceEth: string; timestamp: number }[]; // received purchase offers
		createdAt: number;
		status: "active" | "pending" | "completed" | "cancelled";
		acceptedOffer?: { buyer: string; priceEth: string; timestamp: number }; // for pending
		comment?: string; // Optional comment from seller
	};

	// Type for interested people with their prices
	type InterestedBuyer = {
		address: string;
		priceEth: string;
		timestamp: number;
		comment?: string; // Optional comment from interested buyer
	};

	const [saleContracts, setSaleContracts] = useState<SaleContract[]>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("numberz_contracts");
			if (saved) {
				try {
					const parsed = JSON.parse(saved);
					if (Array.isArray(parsed)) {
						return parsed;
					}
				} catch (e) {
					console.error("Error parsing localStorage contracts:", e);
					localStorage.removeItem("numberz_contracts");
				}
			}
		}
		return [];
	});

	// Synchronize changes of saleContracts to other tabs AND localStorage
	useEffect(() => {
		try {
			localStorage.setItem("numberz_contracts", JSON.stringify(saleContracts));
			sync.broadcastContracts(saleContracts);
		} catch (e) {
			console.error("Error saving contracts:", e);
		}
	}, [saleContracts]);

	const [selectedSaleMode, setSelectedSaleMode] = useState<"buyOffer" | "fixedPrice" | null>(null);
	const [salePrice, setSalePrice] = useState<string>("");

	// State for interest popup
	const [showInterestPopup, setShowInterestPopup] = useState(false);
	const [interestedItemId, setInterestedItemId] = useState<string | null>(null);
	const [interestedPrice, setInterestedPrice] = useState<string>("");
	const [interestedComment, setInterestedComment] = useState<string>("");
	
	// State for promo code
	const [showPromoPopup, setShowPromoPopup] = useState(false);
	const [promoCode, setPromoCode] = useState<string>("");
	const [promoItemId, setPromoItemId] = useState<string | null>(null);
	const [promoDiscount, setPromoDiscount] = useState<number>(0);
	
	// State for sale comment
	const [saleComment, setSaleComment] = useState<string>("");
	
	// Change from Map to Object for localStorage serialization
	const [interestedByWithPrice, setInterestedByWithPrice] = useState<Record<string, InterestedBuyer[]>>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("numberz_interested");
			if (saved) {
				try {
					const parsed = JSON.parse(saved);
					if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
						return parsed;
					}
				} catch (e) {
					console.error("Error parsing localStorage interested:", e);
					localStorage.removeItem("numberz_interested");
				}
			}
		}
		return {};
	});

	// Synchronize changes of interestedByWithPrice to localStorage and other tabs
	useEffect(() => {
		try {
			localStorage.setItem("numberz_interested", JSON.stringify(interestedByWithPrice));
			sync.broadcastInterested(interestedByWithPrice);
		} catch (e) {
			console.error("Error saving interested:", e);
		}
	}, [interestedByWithPrice]);

	// Prevent body scroll when popup is open
	useEffect(() => {
		const scrollY = window.scrollY;
		if (showInterestPopup || showPromoPopup || selected) {
			document.body.classList.add('scroll-locked');
			document.body.style.top = `-${scrollY}px`;
		} else {
			document.body.classList.remove('scroll-locked');
			document.body.style.top = '';
			window.scrollTo(0, scrollY);
		}
		return () => {
			document.body.classList.remove('scroll-locked');
			document.body.style.top = '';
		};
	}, [showInterestPopup, showPromoPopup, selected]);

	// New: Base Balance
	const [baseBalance, setBaseBalance] = useState<string>("0");

	// Listen for MetaMask account changes
	useEffect(() => {
		if (typeof window === "undefined") return;
		const eth = (window as any).ethereum;
		if (!eth) return;

		const handleAccountsChanged = async (accounts: string[]) => {
			if (accounts.length === 0) {
				// User has disconnected all accounts
				setAccount(null);
				setNetworkCorrect(false);
				setCurrentChainId(null);
				setBaseBalance("0");
			} else if (accounts[0] !== account) {
				// User has changed account
				setAccount(accounts[0]);
				
				// Get balance of new account
				try {
					const balanceHex = await eth.request({ method: "eth_getBalance", params: [accounts[0], "latest"] });
					const parsed = parseInt(balanceHex, 16);
					if (!Number.isNaN(parsed)) {
						setBaseBalance((parsed / 1e18).toFixed(4));
					}
				} catch (err) {
					console.warn("Error retrieving balance:", err);
				}

				// Check network of new account
				try {
					const chain = await eth.request({ method: "eth_chainId" });
					setCurrentChainId(chain);
					setNetworkCorrect(chain === BASE_CHAIN_ID); // Base Mainnet
				} catch (err) {
					console.warn("Error checking network:", err);
				}
			}
		};

		const handleChainChanged = (chainId: string) => {
			setCurrentChainId(chainId);
			setNetworkCorrect(chainId === BASE_CHAIN_ID);
			// Refresh page to avoid inconsistent states (recommended by MetaMask)
			window.location.reload();
		};

		// Add listeners
		eth.on("accountsChanged", handleAccountsChanged);
		eth.on("chainChanged", handleChainChanged);

		// Cleanup
		return () => {
			if (eth.removeListener) {
				eth.removeListener("accountsChanged", handleAccountsChanged);
				eth.removeListener("chainChanged", handleChainChanged);
			}
		};
	}, [account]);

	// Close modal with Escape
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setSelected(null);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	// Initialize achievements on mount
	useEffect(() => {
		if (achievements.length === 0) {
			initializeAchievements();
		}
	}, []);

	const connectWallet = async () => {
		if (typeof window === "undefined") return;
		const eth = (window as any).ethereum;
		if (!eth || typeof eth.request !== "function") {
			setShowWalletModal(true);
			return;
		}

		try {
			// FORCER la demande de permissions à chaque fois pour garantir l'interaction avec MetaMask
			// This ALWAYS opens the MetaMask popup even if the app was already connected
			let accounts: string[] | undefined;
			
			try {
				// Demander explicitement les permissions (ouvre TOUJOURS MetaMask)
				await eth.request({ 
					method: "wallet_requestPermissions", 
					params: [{ eth_accounts: {} }] 
				});
				
				// Après avoir obtenu la permission, récupérer les comptes
				accounts = await eth.request({ method: "eth_accounts" });
			} catch (permErr) {
				// Si wallet_requestPermissions échoue, essayer la méthode standard
				try {
					accounts = await eth.request({ method: "eth_requestAccounts" });
				} catch (reqErr) {
					throw permErr || reqErr;
				}
			}

			if (!accounts || accounts.length === 0) {
				alert("Aucun compte détecté dans le wallet. Vérifiez votre extension/wallet et réessayez.");
				return;
			}

			const selectedAccount = accounts[0];
			setAccount(selectedAccount);

			console.log(`✅ Connecté au wallet: ${selectedAccount}`);
			console.log(`🏦 Wallet banque: ${bankWalletAddress}`);
			console.log(`🔐 Est le wallet banque: ${selectedAccount.toLowerCase() === bankWalletAddress.toLowerCase()}`);

			// Get ETH balance (defensive if response isn't correct)
			let balanceHex: string | null = null;
			try {
				balanceHex = await eth.request({ method: "eth_getBalance", params: [selectedAccount, "latest"] });
			} catch (balErr) {
				console.warn("Unable to retrieve balance via eth_getBalance:", balErr);
			}
			if (balanceHex) {
				const parsed = parseInt(balanceHex, 16);
				if (!Number.isNaN(parsed)) {
					setBaseBalance((parsed / 1e18).toFixed(4));
				}
			}

			// Vérifier le réseau
			let chain: string | null = null;
			try {
				chain = await eth.request({ method: "eth_chainId" });
				setCurrentChainId(chain); // Sauvegarder le chainId actuel
			} catch (chainErr) {
				console.warn("Unable to retrieve eth_chainId:", chainErr);
			}

			if (chain && chain !== BASE_CHAIN_ID) {
				try {
					await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: BASE_CHAIN_ID }] });
					setNetworkCorrect(true);
					setCurrentChainId(BASE_CHAIN_ID);
				} catch (switchErr) {
					// Certains wallets refusent le switch programmatique — informer l'utilisateur
					alert("Please manually switch your wallet to Base Mainnet.");
				}
			} else if (chain === BASE_CHAIN_ID) {
				setNetworkCorrect(true);
			} else {
				// Si on n'a pas pu lire le chainId, on laisse networkCorrect à false mais pas bloquant
				setNetworkCorrect(false);
			}
		} catch (err: any) {
			console.error("Error connecting wallet:", err);
			// Montrer un message utilisateur plus clair
			alert("Wallet connection error: " + (err?.message || String(err)));
		}
	};

	const disconnectWallet = () => {
		setAccount(null);
		setNetworkCorrect(false);
		setCurrentChainId(null);
		setBaseBalance("0");
		// Forcer la reconnexion à la prochaine fois
		localStorage.removeItem("walletConnected");
	};

	const clearAllData = () => {
		// Vérifier que c'est le compte admin (banque)
		if (account?.toLowerCase() !== bankWalletAddress.toLowerCase()) {
			alert("❌ Only the administrator account (Bank) can delete data.");
			return;
		}

		// Unique confirmation with modal window
		const confirmed = window.confirm(
			"⚠️ WARNING - COMPLETE DELETION OF ALL DATA\n\n" +
			"This will PERMANENTLY erase FOR ALL USERS:\n\n" +
			"• All owned Numbers (exotic, legendary, etc.)\n" +
			"• All ownership rights\n" +
			"• All Sale Contracts\n" +
			"• All Certificates\n" +
			"• All Interested People\n" +
			"• All Achievements\n\n" +
			"The application will become BLANK as if no one had ever used it.\n\n" +
			"⚠️ THIS ACTION IS IRREVERSIBLE ⚠️\n\n" +
			"Are you ABSOLUTELY sure you want to continue?"
		);
		
		if (!confirmed) {
			return;
		}

		try {
			// Delete ALL data for ALL users
			// 1. Main data
			localStorage.removeItem("numberz_numbers");
			localStorage.removeItem("numberz_contracts");
			localStorage.removeItem("numberz_certs");
			localStorage.removeItem("numberz_interested");
			localStorage.removeItem("numberz_achievements");
			
			// 2. Delete ALL keys that contain user data
			// (au cas où il y aurait des clés avec préfixes wallet-specific)
			const allKeys = Object.keys(localStorage);
			allKeys.forEach(key => {
				if (key.startsWith("numberz_") || 
				    key.includes("wallet") || 
				    key.includes("0x") ||
				    key.includes("number") ||
				    key.includes("contract") ||
				    key.includes("cert") ||
				    key.includes("achievement")) {
					localStorage.removeItem(key);
				}
			});
			
			// 3. Réinitialiser tous les états à leur valeur initiale
			setNumbers(initialNumbers);
			setSaleContracts([]);
			setCerts([]);
			setInterestedByWithPrice({});
			setAchievements([]);
			
			// 4. Diffuser le reset à tous les onglets/fenêtres ouverts
			const channel = new BroadcastChannel("numberz_sync");
			channel.postMessage({ 
				type: "GLOBAL_RESET",
				timestamp: Date.now()
			});
			channel.close();
			
		console.log("🗑️ ALL data has been deleted by bank wallet");
		
		alert("✅ All data has been PERMANENTLY deleted. The page will refresh.");
		window.location.reload();
	} catch (error) {
		console.error("Error deleting data:", error);
		alert("❌ An error occurred during deletion.");
	}
};

	// ETH to hex wei conversion (simple)
	const ethToHexWei = (eth: string) => {
		const parts = eth.split(".");
		const whole = BigInt(parts[0] || "0");
		const frac = parts[1] || "";
		let fracPadded = (frac + "0".repeat(18)).slice(0, 18);
		const wei = whole * BigInt("1000000000000000000") + BigInt(fracPadded);
		return "0x" + wei.toString(16);
	};	// Validation and application of promo code
	const validatePromoCode = (code: string): number => {
		// Simple promo code: R0MAINTH4G0AT = 20% discount
		const codeUpper = code.toUpperCase().trim();
		
		if (codeUpper === "R0MAINTH4G0AT") {
			return 20; // 20% discount
		}
		return 0; // No discount
	};

	const applyPromoCode = (item: NumItem) => {
		const discount = validatePromoCode(promoCode);
		if (discount > 0) {
			const originalPrice = parseFloat(item.priceEth);
			const discountedPrice = (originalPrice * (1 - discount / 100)).toFixed(4);
			setPromoDiscount(discount);
			alert(`✅ Promo code applied! -${discount}% → ${discountedPrice} ETH instead of ${item.priceEth}`);
			
			// Simulate purchase with discount
			const eth = (window as any).ethereum;
			if (!eth) {
				alert("Wallet not found.");
				return;
			}
			try {
				const txParams = {
					from: account,
					to: bankWalletAddress,
					value: ethToHexWei(discountedPrice),
				};
				eth.request({ method: "eth_sendTransaction", params: [txParams] }).then((txHash: string) => {
					setNumbers((prev: NumItem[]) => prev.map((n: NumItem) => 
						(n.id === item.id ? { ...n, owner: account, forSale: false, salePrice: undefined } : n)
					));
					if (account) {
						const cert: Cert = { id: `${item.id}-${Date.now()}`, numId: item.id, owner: account, txHash, issuedAt: new Date().toISOString() };
						setCerts((c: Cert[]) => [cert, ...c]);
					}
					alert(`✅ Purchase confirmed with -${discount}% promo! (tx: ${txHash})`);
					setShowPromoPopup(false);
					setPromoCode("");
					setSelected(null);
				}).catch((err: any) => {
					console.error(err);
					alert("Transaction canceled or failed.");
				});
			} catch (err: any) {
				console.error(err);
				alert("Error during transaction.");
			}
		} else {
			alert("❌ Invalid promo code.");
		}
	};

	const buyNumber = async (item: NumItem) => {
		// Prevent purchase of locked easter egg
		if (item.isEasterEgg && !item.unlocked) {
			alert("This easter egg is locked. Complete the required condition to unlock it before purchasing.");
			return;
		}
		if (!account) {
			await connectWallet();
			if (!account) return;
		}
			if (!networkCorrect) {
			alert("Connect to Base Mainnet.");
			return;
		}
		
		// Allow purchase if forSale OR if no owner (available)
		if (item.owner && !item.forSale) {
			alert("This item already belongs to someone and is not for sale.");
			return;
		}		const ethVal = item.forSale ? item.salePrice! : item.priceEth;
		const eth = (window as any).ethereum;
		if (!eth) {
			alert("Wallet not found.");
			return;
		}
		try {
			const txParams = {
				from: account,
				to: item.forSale ? item.owner : bankWalletAddress, // If for sale, send to seller, else to bank
				value: ethToHexWei(ethVal),
			};
			const txHash = await eth.request({ method: "eth_sendTransaction", params: [txParams] });
			
			// Immediate local update — in production wait for confirmation
			setNumbers((prev: NumItem[]) => prev.map((n: NumItem) => 
				(n.id === item.id ? { ...n, owner: account, forSale: false, salePrice: undefined } : n)
			));
			
			// Remove sale contract
			if (item.forSale) {
				setSaleContracts((prev: SaleContract[]) => prev.filter(c => c.numId !== item.id));
			}
			
			const cert: Cert = { id: `${item.id}-${Date.now()}`, numId: item.id, owner: account, txHash, issuedAt: new Date().toISOString() };
			setCerts((c: Cert[]) => [cert, ...c]);
			alert(`✅ Purchase confirmed! (tx: ${txHash}). The number is now yours.`);
		} catch (err: any) {
			console.error(err);
			alert("Transaction canceled or failed.");
		}
	};

	// --- New: initiate sale (create smart contract)
	const initiateNumberSale = async (item: NumItem, mode: "buyOffer" | "fixedPrice", priceEth?: string, comment?: string) => {
		if (!account) {
			alert("Connect your wallet to sell.");
			return;
		}
		if (item.owner?.toLowerCase() !== account.toLowerCase()) {
			alert("You must be the owner to sell this number.");
			return;
		}
		if (mode === "fixedPrice" && (!priceEth || parseFloat(priceEth) <= 0)) {
			alert("Please enter a valid price.");
			return;
		}

		const contract: SaleContract = {
			id: `sale-${item.id}-${Date.now()}`,
			numId: item.id,
			seller: account,
			mode,
			priceEth: mode === "fixedPrice" ? priceEth : undefined,
			buyOffers: [],
			createdAt: Date.now(),
			status: "active",
			comment: comment || undefined, // Store comment if provided
		};

		setSaleContracts((prev: SaleContract[]) => [contract, ...prev]);
		
		// Mark the number as "for sale" if fixedPrice
		if (mode === "fixedPrice") {
			setNumbers((prev: NumItem[]) => prev.map((n: NumItem) => 
				(n.id === item.id ? { ...n, forSale: true, salePrice: priceEth } : n)
			));
										alert(`✅ ${item.label} is now on sale for ${priceEth} ETH!${comment ? ' (with a message)' : ''}`);
		}
		
		setSelectedSaleMode(null);
		setSalePrice("");
		setSaleComment("");
	};

	// --- Cancel a sale offer
	const cancelNumberSale = async (item: NumItem) => {
		if (!account) {
			alert("Connect your wallet to cancel.");
			return;
		}
		if (item.owner?.toLowerCase() !== account.toLowerCase()) {
			alert("You must be the owner to cancel this sale.");
			return;
		}

		const confirmed = window.confirm(`Are you sure you want to cancel the sale of ${item.label}?`);
		if (!confirmed) return;

		// Remove forSale status from the number
		setNumbers((prev: NumItem[]) => prev.map((n: NumItem) => 
			(n.id === item.id ? { ...n, forSale: false, salePrice: undefined } : n)
		));

		// Remove sale contract
		setSaleContracts((prev: SaleContract[]) => prev.filter(c => c.numId !== item.id));

		alert(`✅ The sale of ${item.label} has been canceled!`);
		setSelected({ ...item, forSale: false, salePrice: undefined });
	};

	// --- Accept a purchase offer or confirm the fixed sale
	const acceptSaleOffer = async (contract: SaleContract, buyerOffer?: { buyer: string; priceEth: string; timestamp: number }) => {
		if (!account || contract.seller.toLowerCase() !== account.toLowerCase()) {
			alert("You must be the seller to accept this offer.");
			return;
		}

		// Simulate smart contract signature
		const confirmed = window.confirm(
			`Confirm the sale of ${numbers.find(n => n.id === contract.numId)?.label} for ${buyerOffer?.priceEth || contract.priceEth} ETH?\n\nYou will receive: ${(parseFloat(buyerOffer?.priceEth || contract.priceEth || "0") * 0.7).toFixed(4)} ETH (70% of price)`
		);

		if (!confirmed) return;

		const buyer = buyerOffer?.buyer || account;
		const finalPrice = buyerOffer?.priceEth || contract.priceEth || "0";
		const refundAmount = (parseFloat(finalPrice) * 0.7).toFixed(4);

		// Simulate the smart contract refund call
		const eth = (window as any).ethereum;
		if (eth) {
			try {
				// Simulate signature and smart contract call
				console.log(`Signature request: receiving ${refundAmount} ETH from bank wallet for the sale of ${numbers.find(n => n.id === contract.numId)?.label}`);
				
				const smartContractData = {
					action: "acceptSaleOffer",
					amount: refundAmount,
					itemId: contract.numId,
					seller: account,
					buyer: buyer,
					timestamp: Date.now(),
				};
				
				console.log("Smart Contract Call:", JSON.stringify(smartContractData, null, 2));
				
				// Display signature request
				alert(`🔐 Please sign the transaction via the smart contract...\n\nYou will receive: ${refundAmount} ETH\n\nBank Wallet: ${bankWalletAddress}\nYour address: ${account}`);
				
				// Simulate signature and confirmation
				setTimeout(() => {
					alert(`✅ Transaction confirmed by the bank!\n\n${refundAmount} ETH have been transferred to your address.\n\nTxHash: 0x${Math.random().toString(16).slice(2)}`);
				}, 1000);
				
			} catch (error) {
				console.error("Error during transaction:", error);
			}
		}

		// Update contract
		setSaleContracts((prev: SaleContract[]) =>
			prev.map((c: SaleContract) =>
				c.id === contract.id
					? {
							...c,
							status: "completed",
							acceptedOffer: {
								buyer,
								priceEth: finalPrice,
								timestamp: Date.now(),
							},
						}
					: c
			)
		);

		// Transfer the number to the buyer
		setNumbers((prev: NumItem[]) =>
			prev.map((n: NumItem) =>
				n.id === contract.numId ? { ...n, owner: buyer } : n
			)
		);

		// Create a certificate
		const cert: Cert = {
			id: `${contract.numId}-sale-${Date.now()}`,
			numId: contract.numId,
			owner: buyer,
			txHash: `0x${Math.random().toString(16).slice(2)}`,
			issuedAt: new Date().toISOString(),
		};
		setCerts((c: Cert[]) => [cert, ...c]);

	alert(`✅ Sale confirmed! ${buyer} is now the owner.\n\nYou received ${refundAmount} ETH on your wallet from the bank.`);
	};

	// --- Reject/cancel the sales contract
	const cancelSaleContract = async (contract: SaleContract) => {
		if (!account || contract.seller.toLowerCase() !== account.toLowerCase()) {
			alert("You must be the seller to cancel this contract.");
			return;
		}

		setSaleContracts((prev: SaleContract[]) =>
			prev.map((c: SaleContract) =>
				c.id === contract.id ? { ...c, status: "cancelled" } : c
			)
		);
		alert("Sale contract canceled.");
	};

	// --- Make a purchase offer on a number for sale
	const makeBuyOffer = async (contract: SaleContract, offerPrice: string) => {
		if (!account) {
			alert("Connect your wallet to make an offer.");
			return;
		}
		if (!offerPrice || parseFloat(offerPrice) <= 0) {
			alert("Please enter a valid price.");
			return;
		}

		setSaleContracts((prev: SaleContract[]) =>
			prev.map((c: SaleContract) =>
				c.id === contract.id
					? {
							...c,
							buyOffers: [
								...(c.buyOffers || []),
								{ buyer: account, priceEth: offerPrice, timestamp: Date.now() },
							],
						}
					: c
			)
		);
	alert(`Offer of ${offerPrice} ETH submitted for ${numbers.find(n => n.id === contract.numId)?.label}`);
	};

	// --- Add an interested person with price
	const addInterestWithPrice = (numId: string, buyerAddress: string, priceEth: string, comment?: string) => {
		if (!priceEth || parseFloat(priceEth) <= 0) {
			alert("Please enter a valid price.");
			return;
		}

		const newBuyer: InterestedBuyer = {
			address: buyerAddress,
			priceEth: priceEth,
			timestamp: Date.now(),
			comment: comment || undefined, // Store comment if provided
		};

		const currentList = interestedByWithPrice[numId] || [];
		// Check if the buyer is already interested and update the price
		const existingIndex = currentList.findIndex((b: InterestedBuyer) => b.address.toLowerCase() === buyerAddress.toLowerCase());
		
		if (existingIndex >= 0) {
			currentList[existingIndex] = newBuyer;
		} else {
			currentList.push(newBuyer);
		}

		const newObj = { ...interestedByWithPrice, [numId]: currentList };
		setInterestedByWithPrice(newObj);

		// Also update the NumItem for the counter
		setNumbers((prev: NumItem[]) =>
			prev.map((n: NumItem) => {
				if (n.id === numId) {
					const isAlreadyInterested = (n.interestedBy || []).includes(buyerAddress);
					return {
						...n,
						interestedCount: isAlreadyInterested ? n.interestedCount : (n.interestedCount || 0) + 1,
						interestedBy: isAlreadyInterested ? n.interestedBy : [...(n.interestedBy || []), buyerAddress],
					};
				}
				return n;
			})
		);

		alert(`✅ You are interested at ${priceEth} ETH!${comment ? ' (with a comment)' : ''}`);
	};

	// --- Remove interest
	const removeInterest = (numId: string, buyerAddress: string) => {
		const currentList = interestedByWithPrice[numId] || [];
		const filtered = currentList.filter((b: InterestedBuyer) => b.address.toLowerCase() !== buyerAddress.toLowerCase());

		const newObj = { ...interestedByWithPrice };
		if (filtered.length === 0) {
			delete newObj[numId];
		} else {
			newObj[numId] = filtered;
		}
		setInterestedByWithPrice(newObj);

		setNumbers((prev: NumItem[]) =>
			prev.map((n: NumItem) => {
				if (n.id === numId) {
					return {
						...n,
						interestedCount: Math.max(0, (n.interestedCount || 0) - 1),
						interestedBy: (n.interestedBy || []).filter((addr: string) => addr.toLowerCase() !== buyerAddress.toLowerCase()),
					};
				}
				return n;
			})
		);

		alert(`❌ You are no longer interested.`);
	};

	// --- Transfer your number to another address
	const _transferNumber = async (item: NumItem, toAddress: string) => {
		if (!account) {
			alert("Connect your wallet to transfer.");
			return;
		}
		if (item.owner?.toLowerCase() !== account.toLowerCase()) {
			alert("You must be the owner to transfer this number.");
			return;
		}
		if (!toAddress || toAddress.length < 6) {
			alert("Invalid recipient address.");
			return;
		}
		if (toAddress.toLowerCase() === account.toLowerCase()) {
			alert("You cannot transfer to yourself.");
			return;
		}

		// Confirm the transfer
		const confirmed = window.confirm(`Transfer ${item.label} to ${toAddress}?\n\nThe recipient will have all rights to this number and it will appear in their collection.`);
		if (!confirmed) return;

		// Local update of ownership - the recipient becomes the new owner
		setNumbers((prev: NumItem[]) => 
			prev.map((n: NumItem) => 
				n.id === item.id 
					? { ...n, owner: toAddress, interestedCount: 0, interestedBy: [] } 
					: n
			)
		);

		// Create transfer certification
		const cert: Cert = { 
			id: `${item.id}-transfer-${Date.now()}`, 
			numId: item.id, 
			owner: toAddress, 
			txHash: `0x${Math.random().toString(16).slice(2)}`, 
			issuedAt: new Date().toISOString() 
		};
		setCerts((c: Cert[]) => [cert, ...c]);

		// Close the modal and transfer mode
		setSelected(null);
		setTradeMode(false);
		setTradeAddress("");

		alert(`✅ ${item.label} has been successfully transferred to ${toAddress}!\n\nThe recipient is now the exclusive owner of the number.`);
	};

	// Filter and sort numbers
	const getFilteredAndSortedNumbers = () => {
		let filtered = numbers;
		
		// Debug: check that Infinity is present
		const hasInfinity = filtered.some(n => n.id === "infinity");
		if (!hasInfinity) {
			console.warn("⚠️ INFINITY NOT FOUND IN NUMBERS ARRAY! Total numbers:", filtered.length);
		}

		// Apply search filter FIRST
		if (query && query.trim().length > 0) {
			const queryLower = query.toLowerCase().trim();
			const beforeFilter = filtered.length;
			filtered = filtered.filter(n => 
				n.label.toLowerCase().includes(queryLower) || 
				n.id.toLowerCase().includes(queryLower) ||
				(n.description && n.description.toLowerCase().includes(queryLower))
			);
			console.log(`🔍 Search "${query}": ${beforeFilter} → ${filtered.length} results`);
			console.log("Results:", filtered.map(n => `${n.id}(${n.label})`).join(", "));
		}

		// Apply filter type
		if (filterType === "available") {
			filtered = filtered.filter(n => !n.owner);
		} else if (filterType === "ownedByMe") {
			filtered = filtered.filter(n => n.owner?.toLowerCase() === account?.toLowerCase());
		} else if (filterType === "ownedByOthers") {
			filtered = filtered.filter(n => n.owner && n.owner.toLowerCase() !== account?.toLowerCase());
		} else if (filterType === "forSale") {
			filtered = filtered.filter(n => n.forSale === true);
		}

		// Apply sort
		if (sortBy === "priceAsc") {
			filtered = [...filtered].sort((a, b) => parseFloat(a.priceEth) - parseFloat(b.priceEth));
		} else if (sortBy === "priceDesc") {
			filtered = [...filtered].sort((a, b) => parseFloat(b.priceEth) - parseFloat(a.priceEth));
		} else if (sortBy === "rarity") {
			const rarityOrder: Record<string, number> = { "Ultimate": -1, "Legendary": 0, "Rare": 1, "Uncommon": 2, "Common": 3, "Exotic": 0.5 };
			filtered = [...filtered].sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
		} else if (sortBy === "mostInterested") {
			filtered = [...filtered].sort((a, b) => (b.interestedCount || 0) - (a.interestedCount || 0));
		}

		return filtered;
	};

	// Pagination: Obtenir seulement les items de la page actuelle
	const getPaginatedNumbers = () => {
		const allFiltered = getFilteredAndSortedNumbers();
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return allFiltered.slice(startIndex, endIndex);
	};

	// Calculate the total number of pages
	const getTotalPages = () => {
		const allFiltered = getFilteredAndSortedNumbers();
		return Math.ceil(allFiltered.length / itemsPerPage);
	};

	// Reset page to 1 when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [filterType, sortBy, query]);

	// Generate status badge
	const getOwnershipBadge = (item: NumItem) => {
		if (!item.owner) {
			return { label: "Available", color: "#10b981", bg: "rgba(16, 185, 129, 0.2)" };
		}
		if (item.owner.toLowerCase() === account?.toLowerCase()) {
			return { label: "You Own", color: "#fbbf24", bg: "rgba(251, 191, 36, 0.2)" };
		}
		return { label: `Owned by ${item.owner.slice(0, 6)}...`, color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.2)" };
	};

	// Easter egg detection and unlock
	const detectEasterEgg = (searchQuery: string) => {
		if (!account) return null;

		const query = searchQuery.toLowerCase().trim();
		const easterEggs: Record<string, string> = {
			"darius": "d_darius",
			"wukong": "w_wukong",
			"half-life": "h_halflife",
			"nyan": "n_nyan",
			"meme": "m_meme",
		};

		if (easterEggs[query]) {
			return easterEggs[query];
		}
		return null;
	};

	// --- NEW: stable tryUnlockByAction (useCallback) placed BEFORE effects that use it
	const tryUnlockByAction = useCallback((eggId: string) => {
		setNumbers(prev => {
			return prev.map(n => {
				if (n.id === eggId) {
					// If already unlocked, do nothing
					if (n.unlocked) return n;
					// Unlock
					const newItem = { ...n, unlocked: true };
					// If free to claim and user connected => assign directly
					if (newItem.isFreeToClaim && account) {
						newItem.owner = account;
					}
					return newItem;
				}
				return n;
			});
		});
	}, [account]);

	// Effects to trigger unlocks based on counters
	useEffect(() => {
		// Chroma requires 7 logo clicks
		if (logoClickCount >= 7) {
			tryUnlockByAction("c_chroma");
		}
	}, [logoClickCount, tryUnlockByAction]);

	useEffect(() => {
		// Secret requires 10 search icon clicks
		if (searchIconClickCount >= 10) {
			tryUnlockByAction("s_secret");
		}
	}, [searchIconClickCount, tryUnlockByAction]);

	// Track scroll for floating button
	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			const scrollHeight = document.documentElement.scrollHeight;
			const clientHeight = document.documentElement.clientHeight;
			
			// If less than 300px from bottom, show scroll to top arrow
			const isNearBottom = scrollTop + clientHeight >= scrollHeight - 300;
			setShowScrollTop(isNearBottom);
		};

		window.addEventListener('scroll', handleScroll);
		handleScroll(); // Check initial state
		
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Attempt to unlock based on interactions (logo clicks, search icon clicks, or search)


	// Unlock easter egg
	const unlockEasterEgg = (eggId: string) => {
		let updated: NumItem[] = [];
		setNumbers(prev => {
			updated = prev.map(n => {
				if (n.id === eggId && !n.owner) {
					// If it's a free easter egg, add directly to My Numbers
					if (n.isFreeToClaim) {
					return { ...n, owner: account };
				}
				// Otherwise, just make it available (owner remains null, but it's now purchasable)
				return n;
			}
			return n;
		});
		return updated;
	});

	// Display appropriate message
	const eggItem = updated.find(n => n.id === eggId);
	if (eggItem?.isFreeToClaim) {
		alert("🎉 Easter egg found! It has been added to your collection!");
	} else {
		alert("🔓 Easter egg unlocked! It is now available for purchase in the collection");
	}

	// Check for achievements
	checkAchievements(updated);
};	// Initialize achievements
	const initializeAchievements = () => {
		const defaultAchievements: Achievement[] = [
			{ id: "first_egg", name: "🐣 Egg Hunter", description: "Unlock your first easter egg", icon: "🥚", unlocked: false },
			{ id: "all_eggs", name: "🐰 Bunny Master", description: "Unlock all easter eggs", icon: "🐰", unlocked: false },
			{ id: "collector", name: "👑 Collector", description: "Own one number of each rarity", icon: "👑", unlocked: false },
			{ id: "legendary_collector", name: "⭐ Legendary Collector", description: "Own all legendary numbers", icon: "⭐", unlocked: false },
			{ id: "exotic_collector", name: "🌟 Exotic Collector", description: "Own all exotic numbers", icon: "🌟", unlocked: false },
			{ id: "rare_master", name: "💎 Rare Master", description: "Own 5 rare numbers", icon: "💎", unlocked: false },
		];
		setAchievements(defaultAchievements);
	};

	// Check and unlock achievements
	const checkAchievements = (currentNumbers: NumItem[]) => {
		if (!account) return;

		const userNumbers = currentNumbers.filter(n => n.owner?.toLowerCase() === account.toLowerCase());
		const newAchievements = [...achievements];
		let newlyUnlocked: Achievement | null = null;

		// Check for first easter egg
		const hasEasterEgg = userNumbers.some(n => n.isEasterEgg);
		if (hasEasterEgg && !newAchievements.find(a => a.id === "first_egg")?.unlocked) {
			const egg = newAchievements.find(a => a.id === "first_egg");
			if (egg) {
				egg.unlocked = true;
				egg.unlockedAt = Date.now();
				newlyUnlocked = egg;
			}
		}

		// Check for all easter eggs
		const allExoticNumbers = currentNumbers.filter(n => n.rarity === "Exotic");
		const hasAllEggs = allExoticNumbers.every(n => n.owner?.toLowerCase() === account.toLowerCase());
		if (hasAllEggs && !newAchievements.find(a => a.id === "all_eggs")?.unlocked) {
			const egg = newAchievements.find(a => a.id === "all_eggs");
			if (egg) {
				egg.unlocked = true;
				egg.unlockedAt = Date.now();
				newlyUnlocked = egg;
			}
		}

		// Check for one of each rarity
		const rarities = new Set(userNumbers.map(n => n.rarity));
		if (rarities.has("Legendary") && rarities.has("Rare") && rarities.has("Uncommon") && rarities.has("Common") && !newAchievements.find(a => a.id === "collector")?.unlocked) {
			const achievement = newAchievements.find(a => a.id === "collector");
			if (achievement) {
				achievement.unlocked = true;
				achievement.unlockedAt = Date.now();
				newlyUnlocked = achievement;
			}
		}

		// Check for all legendary
		const allLegendary = currentNumbers.filter(n => n.rarity === "Legendary");
		const hasAllLegendary = allLegendary.every(n => n.owner?.toLowerCase() === account.toLowerCase());
		if (hasAllLegendary && allLegendary.length > 5 && !newAchievements.find(a => a.id === "legendary_collector")?.unlocked) {
			const achievement = newAchievements.find(a => a.id === "legendary_collector");
			if (achievement) {
				achievement.unlocked = true;
				achievement.unlockedAt = Date.now();
				newlyUnlocked = achievement;
			}
		}

		// Check for all exotic
		if (hasAllEggs && !newAchievements.find(a => a.id === "exotic_collector")?.unlocked) {
			const achievement = newAchievements.find(a => a.id === "exotic_collector");
			if (achievement) {
				achievement.unlocked = true;
				achievement.unlockedAt = Date.now();
				newlyUnlocked = achievement;
			}
		}

		// Check for 5 rare numbers
		const rareNumbers = currentNumbers.filter(n => n.rarity === "Rare" && n.owner?.toLowerCase() === account.toLowerCase());
		if (rareNumbers.length >= 5 && !newAchievements.find(a => a.id === "rare_master")?.unlocked) {
			const achievement = newAchievements.find(a => a.id === "rare_master");
			if (achievement) {
				achievement.unlocked = true;
				achievement.unlockedAt = Date.now();
				newlyUnlocked = achievement;
			}
		}

		setAchievements(newAchievements);

		// Show notification if new achievement
		if (newlyUnlocked) {
			setLastAchievement(newlyUnlocked);
			setShowAchievementModal(true);
			setTimeout(() => setShowAchievementModal(false), 5000);
		}
	};

	// --- NEW: déclencher la vérification des achievements quand numbers ou account changent
	useEffect(() => {
		if (!account) return;
		checkAchievements(numbers);
		// intentionally depends on numbers and account only
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [numbers, account]);

	// helper: couleur/style selon la rareté (utilisé pour modal / gradient des cartes)
	const rarityStyle = (r: NumItem["rarity"]) => {
		switch (r) {
			case "Ultimate":
				return { badge: "from-purple-500 via-pink-500 to-yellow-400 text-white", gradient: "from-purple-500 via-pink-500 to-yellow-400", glowColor: "rgba(168, 85, 247, 1)", badgeColor: "linear-gradient(135deg, rgba(168, 85, 247, 0.5), rgba(236, 72, 153, 0.5), rgba(251, 191, 36, 0.5))", badgeBorder: "rgba(168, 85, 247, 1)", badgeText: "#fef08a" };
			case "Legendary":
				return { badge: "from-yellow-400 to-orange-500 text-black", gradient: "from-yellow-400 to-amber-500", glowColor: "rgba(251, 191, 36, 0.4)", badgeColor: "rgba(251, 191, 36, 0.3)", badgeBorder: "rgba(251, 191, 36, 0.5)", badgeText: "#fbbf24" };
			case "Rare":
				return { badge: "bg-indigo-600 text-white", gradient: "from-indigo-600 to-violet-500", glowColor: "rgba(79, 70, 229, 0.4)", badgeColor: "rgba(79, 70, 229, 0.2)", badgeBorder: "rgba(79, 70, 229, 0.4)", badgeText: "#a78bfa" };
			case "Uncommon":
				return { badge: "bg-emerald-400 text-black", gradient: "from-emerald-400 to-teal-500", glowColor: "rgba(16, 185, 129, 0.4)", badgeColor: "rgba(16, 185, 129, 0.2)", badgeBorder: "rgba(16, 185, 129, 0.4)", badgeText: "#6ee7b7" };
			case "Exotic":
				return { badge: "from-pink-500 to-purple-600 text-white", gradient: "from-pink-500 to-purple-600", glowColor: "rgba(236, 72, 153, 0.4)", badgeColor: "rgba(236, 72, 153, 0.2)", badgeBorder: "rgba(236, 72, 153, 0.5)", badgeText: "#f472b6" };
			default:
				return { badge: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100", gradient: "from-slate-700 to-slate-900", glowColor: "rgba(148, 163, 184, 0.3)", badgeColor: "rgba(148, 163, 184, 0.2)", badgeBorder: "rgba(148, 163, 184, 0.4)", badgeText: "#cbd5e1" };
		}
	};

	// helper: copy text
	const _copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			alert("Copié dans le presse-papier");
		} catch {
			alert("Unable to copy");
		}
	};

	// UI - Pure CSS Version
	if (!hydrated) {
		return (
			<div className="lux-root" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'rgba(255,255,255,0.5)'}}>
				<div>Loading...</div>

{/* Wallet Connection Modal */}
{showWalletModal && (
<div style={{
position: 'fixed',
inset: 0,
backgroundColor: 'rgba(0, 0, 0, 0.5)',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
zIndex: 10000,
backdropFilter: 'blur(4px)'
}} onClick={() => setShowWalletModal(false)}>
<div style={{
backgroundColor: '#0a0e27',
border: '1px solid rgba(255,255,255,0.1)',
borderRadius: '1.5rem',
padding: '2rem',
maxWidth: '900px',
width: '90%',
maxHeight: '90vh',
overflowY: 'auto',
boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
}} onClick={(e: any) => e.stopPropagation()}>
{/* Close Button */}
<button 
onClick={() => setShowWalletModal(false)}
style={{
position: 'absolute',
top: '1.5rem',
right: '1.5rem',
width: '40px',
height: '40px',
borderRadius: '50%',
background: 'rgba(255,255,255,0.05)',
border: '1px solid rgba(255,255,255,0.1)',
color: 'rgba(255,255,255,0.7)',
cursor: 'pointer',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
transition: 'all 0.3s'
}}
onMouseEnter={(e: any) => {
e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
}}
onMouseLeave={(e: any) => {
e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
}}
>
✕
</button>

<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start'}}>
{/* Left Column - Wallets */}
<div>
<h2 style={{color: 'white', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem'}}>Connecter un portefeuille</h2>
<div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
{[
{ name: 'MetaMask', icon: '🦊' },
{ name: 'WalletConnect', icon: '🌐' },
{ name: 'Ledger', icon: '🔐' },
{ name: 'Coinbase Wallet', icon: '◯' },
{ name: 'Rainbow', icon: '🌈' }
].map((wallet) => (
<button
key={wallet.name}
onClick={() => {
setShowWalletModal(false);
connectWallet();
}}
style={{
padding: '1rem',
borderRadius: '0.75rem',
background: 'rgba(255,255,255,0.05)',
border: '1px solid rgba(255,255,255,0.1)',
color: 'white',
fontSize: '1rem',
fontWeight: 500,
cursor: 'pointer',
display: 'flex',
alignItems: 'center',
gap: '1rem',
transition: 'all 0.3s',
textAlign: 'left'
}}
onMouseEnter={(e: any) => {
e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.4)';
}}
onMouseLeave={(e: any) => {
e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
}}
>
<span style={{fontSize: '1.5rem'}}>{wallet.icon}</span>
{wallet.name}
</button>
))}
</div>
</div>

{/* Right Column - Info */}
<div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
<div>
<h3 style={{color: 'white', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem'}}>Qu'est-ce qu'un portefeuille?</h3>
								<p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: '1.6'}}>
									Un foyer pour vos actifs numériques. Les portefeuilles sont utilisés pour envoyer, recevoir, stocker et afficher des actifs numériques comme Ethereum et les NFTs.
								</p>
							</div>
							<div>
								<h3 style={{color: 'white', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem'}}>Une nouvelle façon de se connecter</h3>
								<p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: '1.6'}}>
									Au lieu de créer de nouveaux comptes et mots de passe sur chaque site Web, connectez simplement votre portefeuille.
								</p>
							</div>
							<a href="https://ethereum.org/fr/wallets/" target="_blank" rel="noopener noreferrer" style={{
								padding: '0.75rem 1.5rem',
								borderRadius: '2rem',
								background: '#3b82f6',
								color: 'white',
								textDecoration: 'none',
								fontSize: '0.875rem',
								fontWeight: 600,
								textAlign: 'center',
								transition: 'all 0.3s',
								cursor: 'pointer',
								display: 'inline-block'
							}}
							onMouseEnter={(e: any) => {
								e.currentTarget.style.background = '#2563eb';
								e.currentTarget.style.transform = 'scale(1.05)';
							}}
							onMouseLeave={(e: any) => {
								e.currentTarget.style.background = '#3b82f6';
								e.currentTarget.style.transform = 'scale(1)';
							}}
							>
								Obtenir un portefeuille
							</a>
						</div>
					</div>
				</div>
			</div>
		)}

			</div>
	);
}

	return (
		<div className="lux-root">
		{/* Achievement Modal */}
		{showAchievementModal && lastAchievement && (
			<div style={{position: 'fixed', top: '2rem', right: '2rem', zIndex: 9999, animation: 'slideIn 0.3s ease-out'}}>
				<div style={{background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))', border: '2px solid rgba(236, 72, 153, 0.5)', borderRadius: '1rem', padding: '1.5rem', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(236, 72, 153, 0.3)'}}>
					<div style={{fontSize: '3rem', textAlign: 'center', marginBottom: '0.5rem'}}>
						{lastAchievement.icon}
					</div>
					<div style={{fontSize: '1.25rem', fontWeight: 700, color: '#f472b6', marginBottom: '0.25rem', textAlign: 'center'}}>
						{lastAchievement.name}
					</div>
					<div style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', textAlign: 'center'}}>
						{lastAchievement.description}
					</div>
				</div>
			</div>
		)}

		{/* Navigation */}
		<nav className="lux-nav">
			<div className="lux-nav-content" style={{
				transition: 'all 0.3s ease',
				flexWrap: 'wrap',
				gap: '0.75rem'
			}}>
				{/* Logo */}
				<div 
					className="lux-logo" 
					onClick={() => { setSelected(null); setQuery(""); setSearchOpen(false); setLogoClickCount(c => c + 1); }}
					style={{
						transition: 'all 0.3s ease',
						transform: searchOpen ? 'scale(0.75)' : 'scale(1)',
						transformOrigin: 'left center',
						opacity: searchOpen ? 0.7 : 1,
						minWidth: 'fit-content'
					}}
				>
					<div className="lux-logo-icon">
						<img src="/favicon.png" alt="Numberz" style={{width: '100%', height: '100%', borderRadius: '6px'}} />
					</div>
					<div className="lux-logo-text" style={{display: searchOpen ? 'none' : 'block'}}>
						<h1>Numberzz</h1>
						<span>NFT COLLECTION</span>
					</div>
				</div>

				{/* Search - Collapsible */}
				<div className="lux-search" style={{position: 'relative', display: 'flex', alignItems: 'center', flex: searchOpen ? '1' : 'initial'}}>
					{searchOpen ? (
						<>
							<input
								value={query}
								onChange={(e: any) => setQuery(e.target.value)}
								onKeyDown={(e: any) => {
									if (e.key === "Enter" && account) {
										const eggId = detectEasterEgg(query);
										if (eggId) {
											unlockEasterEgg(eggId);
											setQuery("");
											setSearchOpen(false);
										}
									}
									if (e.key === "Escape") {
										setSearchOpen(false);
										setQuery("");
									}
								}}
								placeholder="Search... (try: darius, wukong, nyan...)"
								className="lux-search-input"
								autoFocus
								style={{
									width: '100%',
									minWidth: '200px',
									transition: 'width 0.3s ease',
								}}
							/>
							<button 
								onClick={() => { setSearchOpen(false); setQuery(""); }}
								style={{
									position: 'absolute',
									right: '0.75rem',
									background: 'transparent',
									border: 'none',
									color: 'rgba(255,255,255,0.5)',
									cursor: 'pointer',
									padding: '0.25rem',
									display: 'flex',
									alignItems: 'center',
									transition: 'color 0.2s'
								}}
								onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
								onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
							>
								<svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</>
					) : (
						<button 
							onClick={() => { setSearchOpen(true); setSearchIconClickCount(c => c + 1); }}
							style={{
								background: 'rgba(255,255,255,0.05)',
								border: '1px solid rgba(255,255,255,0.1)',
								borderRadius: '0.75rem',
								padding: '0.75rem',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								transition: 'all 0.2s',
								color: 'rgba(255,255,255,0.7)'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
								e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.3)';
								e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
								e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
								e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
							}}
						>
							<svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</button>
					)}
				</div>

				{/* Spacer pour pousser les boutons à droite sur desktop */}
				<div style={{flex: 1, minWidth: '20px', display: searchOpen ? 'none' : 'block'}} />

				{/* Mobile Menu Button (visible uniquement sur petit écran) */}
				<button 
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					style={{
						display: 'none', // Sera visible via media query en CSS
						background: 'rgba(255,255,255,0.05)',
						border: '1px solid rgba(255,255,255,0.1)',
						borderRadius: '0.75rem',
						padding: '0.75rem',
						cursor: 'pointer',
						color: 'rgba(255,255,255,0.7)',
						transition: 'all 0.2s'
					}}
					className="mobile-menu-btn"
				>
					<svg style={{width: '24px', height: '24px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{mobileMenuOpen ? (
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						) : (
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						)}
					</svg>
				</button>

				{/* Wallet - Desktop view */}
				<div 
					className="lux-wallet lux-wallet-desktop"
					style={{
						transition: 'all 0.3s ease',
						gap: '0.5rem',
						flexWrap: 'wrap',
						alignItems: 'center'
					}}
				>
					{account && (
						<>
							<div 
								className="lux-wallet-badge"
								style={{
									transition: 'all 0.3s ease',
									fontSize: '0.75rem',
									whiteSpace: 'nowrap'
								}}
								title={networkCorrect ? "✅ Connected to Base Mainnet (Chain ID: 8453)" : "⚠️ Wrong network - Please switch to Base Mainnet"}
							>
								<div style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: networkCorrect ? '#4ade80' : '#f87171'}} />
								<span>{account.slice(0, 6)}...{account.slice(-4)}</span>
							</div>
							<div style={{
								fontSize: '0.7rem', 
								color: 'rgba(255,255,255,0.6)', 
								display: 'flex', 
								alignItems: 'center', 
								gap: '0.4rem', 
								padding: '0.4rem 0.7rem', 
								background: 'rgba(255,255,255,0.05)', 
								border: '1px solid rgba(255,255,255,0.1)', 
								borderRadius: '6px',
								transition: 'all 0.3s ease',
								whiteSpace: 'nowrap'
							}}>
								<svg style={{width: '0.8rem', height: '0.8rem'}} fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
								</svg>
								{baseBalance} ETH
							</div>
							<button 
								onClick={() => document.querySelector('.lux-hero')?.scrollIntoView({ behavior: 'smooth' })}
								style={{
									padding: '0.5rem 0.75rem', 
									fontSize: '0.75rem', 
									background: 'rgba(255,255,255,0.08)', 
									border: '1px solid rgba(255,255,255,0.1)', 
									borderRadius: '6px', 
									color: 'white', 
									cursor: 'pointer', 
									transition: 'all 0.3s ease',
									whiteSpace: 'nowrap'
								}}
							>
								My Numbers
							</button>
						</>
					)}
					{account && (
						<a href="/easter-eggs" style={{textDecoration: 'none'}}>
							<button 
								className="lux-wallet-btn"
							>
								🔮 Easter Eggs
							</button>
						</a>
					)}
					{account && (
						<button 
							onClick={() => {
								const unlockedCount = achievements.filter(a => a.unlocked).length;
								alert(`🏆 Achievements: ${unlockedCount}/${achievements.length}\n\n${achievements.map(a => (a.unlocked ? "✅" : "🔒") + " " + a.name + "\n" + a.description).join("\n\n")}`);
							}} 
							className="lux-wallet-btn"
						>
							🏆 Achievements
						</button>
					)}
					{account?.toLowerCase() === bankWalletAddress.toLowerCase() && (
						<button 
							onClick={clearAllData} 
							className="lux-wallet-btn"
						>
							🗑️ Clear Data
						</button>
					)}
					<button 
						onClick={account ? disconnectWallet : connectWallet} 
						className="lux-wallet-btn"
						style={{
							transition: 'all 0.3s ease',
							fontSize: '0.875rem',
							padding: '0.6rem 1rem',
							whiteSpace: 'nowrap'
						}}
					>
						{account ? "Disconnect" : "Connect Wallet"}
					</button>
				</div>

				{/* Mobile Menu Dropdown */}
				{mobileMenuOpen && (
					<div 
						className="lux-wallet-mobile"
						style={{
							width: '100%',
							display: 'flex',
							flexDirection: 'column',
							gap: '0.5rem',
							padding: '1rem',
							background: 'rgba(0,0,0,0.8)',
							borderRadius: '1rem',
							border: '1px solid rgba(255,255,255,0.1)',
							animation: 'slideDown 0.3s ease-out'
						}}
					>
						{account && (
							<>
								<div 
									className="lux-wallet-badge"
									style={{
										fontSize: '0.875rem',
										justifyContent: 'center'
									}}
									title={networkCorrect ? "✅ Connected to Base Mainnet" : "⚠️ Wrong network"}
								>
									<div style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: networkCorrect ? '#4ade80' : '#f87171'}} />
									<span>{account.slice(0, 10)}...{account.slice(-8)}</span>
								</div>
								<div style={{
									fontSize: '0.875rem', 
									color: 'rgba(255,255,255,0.6)', 
									display: 'flex', 
									alignItems: 'center', 
									justifyContent: 'center',
									gap: '0.4rem', 
									padding: '0.75rem', 
									background: 'rgba(255,255,255,0.05)', 
									border: '1px solid rgba(255,255,255,0.1)', 
									borderRadius: '6px'
								}}>
									<svg style={{width: '1rem', height: '1rem'}} fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
									</svg>
									{baseBalance} ETH
								</div>
								<button 
									onClick={() => {
										document.querySelector('.lux-hero')?.scrollIntoView({ behavior: 'smooth' });
										setMobileMenuOpen(false);
									}}
									style={{
										width: '100%',
										padding: '0.75rem', 
										fontSize: '0.875rem', 
										background: 'rgba(255,255,255,0.08)', 
										border: '1px solid rgba(255,255,255,0.1)', 
										borderRadius: '6px', 
										color: 'white', 
										cursor: 'pointer', 
										transition: 'all 0.3s ease'
									}}
								>
									My Numbers
								</button>
								<a href="/easter-eggs" style={{textDecoration: 'none', width: '100%'}}>
									<button 
										className="lux-wallet-btn"
										onClick={() => setMobileMenuOpen(false)}
									>
										🔮 Easter Eggs
									</button>
								</a>
								<button 
									onClick={() => {
										const unlockedCount = achievements.filter(a => a.unlocked).length;
										alert(`🏆 Achievements: ${unlockedCount}/${achievements.length}\n\n${achievements.map(a => (a.unlocked ? "✅" : "🔒") + " " + a.name + "\n" + a.description).join("\n\n")}`);
										setMobileMenuOpen(false);
									}} 
									className="lux-wallet-btn"
								>
									🏆 Achievements
								</button>
								{account?.toLowerCase() === bankWalletAddress.toLowerCase() && (
									<button 
										onClick={() => {
											clearAllData();
											setMobileMenuOpen(false);
										}} 
										className="lux-wallet-btn"
									>
										🗑️ Clear Data
									</button>
								)}
							</>
						)}
						<button 
							onClick={() => {
								if (account) {
									disconnectWallet();
								} else {
									connectWallet();
								}
								setMobileMenuOpen(false);
							}} 
							className="lux-wallet-btn"
							style={{
								width: '100%',
								padding: '0.75rem',
								fontSize: '0.875rem'
							}}
						>
							{account ? "Disconnect Wallet" : "Connect Wallet"}
						</button>
					</div>
				)}
			</div>

			{/* Add CSS for responsive behavior */}
			<style>{`
				@media (max-width: 768px) {
					.lux-wallet-desktop {
						display: none !important;
					}
					.mobile-menu-btn {
						display: flex !important;
					}
				}
				@media (min-width: 769px) {
					.lux-wallet-mobile {
						display: none !important;
					}
				}
				@keyframes slideDown {
					from {
						opacity: 0;
						transform: translateY(-10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
			`}</style>
		</nav>			{/* Hero Section - Conditional Content */}
			{account ? (
				<section className="lux-hero" style={{minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<div style={{textAlign: 'center', maxWidth: '700px', width: '100%', padding: '2rem'}}>
						<div style={{fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '2rem'}}>Welcome Back</div>
						
						<h2 style={{fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, marginBottom: '1.5rem'}}>
							My Collection
						</h2>
						
						<p style={{fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', marginBottom: '3rem', lineHeight: 1.6}}>
							You own <span style={{fontSize: '1.3rem', fontWeight: 900, color: '#fbbf24'}}>{numbers.filter(n => n.owner === account).length}</span> number{numbers.filter(n => n.owner === account).length > 1 ? 's' : ''}
						</p>
						
						{numbers.filter(n => n.owner === account).length === 0 ? (
							<div style={{padding: '2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', marginBottom: '2rem'}}>
								<p style={{color: 'rgba(255,255,255,0.5)', fontSize: '1rem'}}>You haven't purchased any numbers yet.</p>
								<p style={{color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginTop: '0.5rem'}}>Start exploring the collection below!</p>
							</div>
						) : (
							<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '1rem', marginBottom: '2rem', padding: '2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem'}}>
								{numbers.filter(n => n.owner === account).map(n => (
									<button
										key={n.id}
										onClick={() => setSelected(n)}
										style={{padding: '1rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(168,85,247,0.1))', border: '1px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.3rem', fontWeight: 900, cursor: 'pointer', transition: 'all 200ms ease'}}
										onMouseEnter={(e) => {
											e.currentTarget.style.background = 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(168,85,247,0.2))';
											e.currentTarget.style.transform = 'scale(1.1)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.background = 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(168,85,247,0.1))';
											e.currentTarget.style.transform = 'scale(1)';
										}}
									>
										{n.label}
									</button>
								))}
							</div>
						)}
					</div>
				</section>
			) : (
				<section className="lux-hero">
					<div style={{textAlign: 'center'}}>
						<div className="lux-hero-badge">
							✨ Base Mainnet • Blockchain-Certified Numbers
						</div>
						
						<h2 style={{fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, marginTop: '2rem', marginBottom: '1rem'}}>
							Own The Infinite
						</h2>
						
						<p style={{fontSize: '1.1rem', color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '1rem auto', lineHeight: 1.6}}>
							Collect unique, blockchain-certified numbers. From legendary constants like <span style={{color: '#fcd34d', fontWeight: 600}}>π</span> and <span style={{color: '#d8b4fe', fontWeight: 600}}>e</span> to rare integers. Each number is a one-of-a-kind digital asset.
						</p>

						<div className="lux-stats">
							<div style={{textAlign: 'center'}}>
								<div style={{fontSize: '1.875rem', fontWeight: 900, color: 'white'}}>{numbers.length}</div>
								<div style={{fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500}}>Numbers Available</div>
							</div>
							<div style={{width: '1px', height: '3rem', backgroundColor: 'rgba(255,255,255,0.1)'}} />
							<div style={{textAlign: 'center'}}>
								<div style={{fontSize: '1.875rem', fontWeight: 900, color: 'white'}}>{numbers.filter(n => n.owner).length}</div>
								<div style={{fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500}}>Already Owned</div>
							</div>
							<div style={{width: '1px', height: '3rem', backgroundColor: 'rgba(255,255,255,0.1)'}} />
							<div style={{textAlign: 'center'}}>
								<div style={{fontSize: '1.875rem', fontWeight: 900, background: 'linear-gradient(to right, #fbbf24, #d8b4fe)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
									{numbers.filter(n => n.rarity === "Ultimate" || n.rarity === "Legendary").length}
								</div>
								<div style={{fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500}}>Legendary Items</div>
							</div>
						</div>
					</div>
				</section>
			)}

			{/* Numbers Grid - List Layout */}
			<main style={{display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1.5rem', maxWidth: '90rem', margin: '0 auto', marginBottom: '4rem'}}>
			{/* Filtres et Tri */}
			<div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', marginBottom: '1rem', marginTop: '1rem'}}>
				<div style={{fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase'}}>Filter:</div>
				{(['all', 'available', 'ownedByMe', 'ownedByOthers', 'forSale'] as const).map(f => (
					<button
						key={f}
						onClick={() => setFilterType(f)}
						style={{padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, border: filterType === f ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(255,255,255,0.1)', background: filterType === f ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.05)', color: filterType === f ? '#fbbf24' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.3s'}}
					>
						{f === 'all' ? 'All' : f === 'available' ? 'Available' : f === 'ownedByMe' ? 'My Numbers' : f === 'ownedByOthers' ? 'Owned by Others' : '🔥 For Sale'}
					</button>
				))}					<div style={{flex: 1}} />
					
					<div style={{fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase'}}>Sort:</div>
					{(['none', 'priceAsc', 'priceDesc', 'rarity', 'mostInterested'] as const).map(s => (
						<button
							key={s}
							onClick={() => setSortBy(s)}
							style={{padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, border: sortBy === s ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.1)', background: sortBy === s ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)', color: sortBy === s ? '#10b981' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all 0.3s'}}
						>
							{s === 'none' ? 'None' : s === 'priceAsc' ? 'Price ↑' : s === 'priceDesc' ? 'Price ↓' : s === 'rarity' ? 'Rarity' : 'Interested 📊'}
						</button>
					))}
				</div>

				{/* DEBUG: Show paginated numbers count */}
				{getPaginatedNumbers().length === 0 && (
					<div style={{textAlign: 'center', padding: '2rem', color: 'orange', fontSize: '0.875rem'}}>
						⚠️ No items on this page. Total in filtered: {getFilteredAndSortedNumbers().length} | Infinity exists: {getFilteredAndSortedNumbers().some(n => n.id === "infinity") ? "✅ YES" : "❌ NO"}
					</div>
				)}

				{getPaginatedNumbers()
					.map((n: NumItem) => {
						const isOwned = !!n.owner;
						const glowColor = rarityStyle(n.rarity).glowColor;
						const interestedCount = n.interestedCount || 0;
						const ownershipBadge = getOwnershipBadge(n);
						
						return (
							<div
								key={n.id}
								style={{
									display: 'flex',
									gap: '1.5rem',
									padding: '1.5rem',
									borderRadius: '1rem',
									background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
									border: '1px solid rgba(255,255,255,0.05)',
									alignItems: 'center',
									transition: 'all 300ms ease',
									cursor: 'pointer',
									position: 'relative'
								}}
								onMouseEnter={(e) => {
									const el = e.currentTarget;
									el.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))';
									el.style.boxShadow = `0 0 30px ${glowColor}`;
									el.style.borderColor = 'rgba(255,255,255,0.15)';
								}}
								onMouseLeave={(e) => {
									const el = e.currentTarget;
									el.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))';
									el.style.boxShadow = 'none';
									el.style.borderColor = 'rgba(255,255,255,0.05)';
								}}
							>
								{/* Number Display */}
								<div
									onClick={() => setSelected(n)}
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										width: '80px',
										height: '80px',
										borderRadius: '0.75rem',
										background: n.rarity === 'Ultimate' 
											? 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(236, 72, 153, 0.25), rgba(168, 85, 247, 0.2))' 
											: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(168, 85, 247, 0.1))',
										border: n.rarity === 'Ultimate' 
											? '2px solid rgba(251, 191, 36, 0.6)' 
											: '1px solid rgba(255,255,255,0.1)',
										flexShrink: 0,
										position: 'relative',
										cursor: 'pointer',
										boxShadow: n.rarity === 'Ultimate' 
											? '0 0 40px rgba(251, 191, 36, 0.5), inset 0 0 20px rgba(251, 191, 36, 0.2)' 
											: 'none'
									}}
								>
									<span style={{
										fontSize: '2rem', 
										fontWeight: 900, 
										color: n.rarity === 'Ultimate' ? '#fef3c7' : 'white', 
										textShadow: n.rarity === 'Ultimate' 
											? '0 0 20px rgba(251, 191, 36, 0.8), 0 10px 30px rgba(0,0,0,0.5)' 
											: '0 10px 30px rgba(0,0,0,0.5)'
									}}>
										{n.label}
									</span>
									
									{/* Mini Recap on Hover */}
									<div style={{
										position: 'absolute',
										bottom: '-110px',
										left: 0,
										background: 'rgba(0,0,0,0.95)',
										border: '1px solid rgba(255,255,255,0.1)',
										borderRadius: '0.75rem',
										padding: '1rem',
										minWidth: '200px',
										opacity: 0,
										pointerEvents: 'none',
										transition: 'opacity 200ms ease',
										zIndex: 50,
										backdropFilter: 'blur(10px)'
									}} className="mini-recap"
										onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
										onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
									>
										<div style={{display: 'grid', gap: '0.5rem', fontSize: '0.875rem'}}>
											<div style={{display: 'flex', justifyContent: 'space-between'}}>
												<span style={{color: 'rgba(255,255,255,0.6)'}}>Prix:</span>
												<span style={{color: 'white', fontWeight: 600}}>{n.priceEth} ETH</span>
											</div>
											<div style={{display: 'flex', justifyContent: 'space-between'}}>
												<span style={{color: 'rgba(255,255,255,0.6)'}}>Statut:</span>
												<span style={{color: isOwned ? '#86efac' : '#4ade80', fontWeight: 600}}>
													{isOwned ? '✓ Pris' : '◉ Disponible'}
												</span>
											</div>
											<div style={{display: 'flex', justifyContent: 'space-between'}}>
												<span style={{color: 'rgba(255,255,255,0.6)'}}>Interested:</span>
												<span style={{color: '#fbbf24', fontWeight: 600}}>{interestedCount}</span>
											</div>
										</div>
									</div>
								</div>

				{/* Info Column */}
				<div
					onClick={() => setSelected(n)}
					style={{flex: 1, cursor: 'pointer'}}
				>
					<div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem'}}>
						<div>
							<div style={{fontSize: '1.25rem', fontWeight: 900, color: 'white'}}>
								{n.label}
							</div>
							<div style={{fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem'}}>
								{n.description ?? `Unique number ID ${n.id}`}
							</div>
						</div>
					</div>
					
					<div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
						<span style={{padding: '0.375rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: rarityStyle(n.rarity).badgeColor, color: rarityStyle(n.rarity).badgeText, border: `1px solid ${rarityStyle(n.rarity).badgeBorder}`, textTransform: 'uppercase', letterSpacing: '0.05em'}}>
							{n.rarity}
							{n.isEasterEgg && !n.unlocked && (
								<span style={{marginLeft: '0.5rem', padding: '0.25rem 0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: '#f87171', fontWeight: 700, fontSize: '0.75rem'}}>
									Locked
								</span>
							)}
						</span>
						<span style={{padding: '0.375rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)'}}>
							{n.priceEth} ETH
						</span>
						<span style={{padding: '0.375rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: ownershipBadge.bg, color: ownershipBadge.color, border: `1px solid ${ownershipBadge.color}40`}}>
							{ownershipBadge.label}
						</span>
					</div>
				</div>								{/* Interested Button & Counter */}
								<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', flexShrink: 0}}>
									<button
										onClick={() => {
											const alreadyInterested = (n.interestedBy || []).includes(account || '');
											if (alreadyInterested) {
												removeInterest(n.id, account || '');
											} else {
												setInterestedItemId(n.id);
												setInterestedPrice("");
												setShowInterestPopup(true);
											}
										}}
										disabled={!account}
										style={{
											padding: '0.75rem 1.5rem',
											borderRadius: '0.75rem',
											fontSize: '0.875rem',
											fontWeight: 600,
											background: (n.interestedBy || []).includes(account || '') ? 'linear-gradient(to right, #f87171, #fbbf24)' : 'rgba(255,255,255,0.05)',
											color: (n.interestedBy || []).includes(account || '') ? 'white' : 'rgba(255,255,255,0.7)',
											border: (n.interestedBy || []).includes(account || '') ? '1px solid rgba(248, 113, 113, 0.3)' : '1px solid rgba(255,255,255,0.1)',
											cursor: account ? 'pointer' : 'not-allowed',
											opacity: account ? 1 : 0.5,
											transition: 'all 200ms ease',
											whiteSpace: 'nowrap'
										}}
										title={account ? 'Mark as interested' : 'Connect your wallet'}
									>
										{(n.interestedBy || []).includes(account || '') ? '❤️ Interested' : '🤍 Interested'}
									</button>
									
									<div style={{
										textAlign: 'center',
										fontSize: '0.75rem',
										color: 'rgba(255,255,255,0.5)',
										fontWeight: 600
									}}>
										{interestedCount} {interestedCount > 1 ? 'interested' : 'interested'}
									</div>
								</div>

{/* Wallet Connection Modal */}
{showWalletModal && (
<div style={{
position: 'fixed',
inset: 0,
backgroundColor: 'rgba(0, 0, 0, 0.5)',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
zIndex: 10000,
backdropFilter: 'blur(4px)'
}} onClick={() => setShowWalletModal(false)}>
<div style={{
backgroundColor: '#0a0e27',
border: '1px solid rgba(255,255,255,0.1)',
borderRadius: '1.5rem',
padding: '2rem',
maxWidth: '900px',
width: '90%',
maxHeight: '90vh',
overflowY: 'auto',
boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
}} onClick={(e: any) => e.stopPropagation()}>
{/* Close Button */}
<button 
onClick={() => setShowWalletModal(false)}
style={{
position: 'absolute',
top: '1.5rem',
right: '1.5rem',
width: '40px',
height: '40px',
borderRadius: '50%',
background: 'rgba(255,255,255,0.05)',
border: '1px solid rgba(255,255,255,0.1)',
color: 'rgba(255,255,255,0.7)',
cursor: 'pointer',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
transition: 'all 0.3s'
}}
onMouseEnter={(e: any) => {
e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
}}
onMouseLeave={(e: any) => {
e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
}}
>
✕
</button>

<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start'}}>
{/* Left Column - Wallets */}
<div>
<h2 style={{color: 'white', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem'}}>Connecter un portefeuille</h2>
<div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
{[
{ name: 'MetaMask', icon: '🦊' },
{ name: 'WalletConnect', icon: '🌐' },
{ name: 'Ledger', icon: '🔐' },
{ name: 'Coinbase Wallet', icon: '◯' },
{ name: 'Rainbow', icon: '🌈' }
].map((wallet) => (
<button
key={wallet.name}
onClick={() => {
setShowWalletModal(false);
connectWallet();
}}
style={{
padding: '1rem',
borderRadius: '0.75rem',
background: 'rgba(255,255,255,0.05)',
border: '1px solid rgba(255,255,255,0.1)',
color: 'white',
fontSize: '1rem',
fontWeight: 500,
cursor: 'pointer',
display: 'flex',
alignItems: 'center',
gap: '1rem',
transition: 'all 0.3s',
textAlign: 'left'
}}
onMouseEnter={(e: any) => {
e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.4)';
}}
onMouseLeave={(e: any) => {
e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
}}
>
<span style={{fontSize: '1.5rem'}}>{wallet.icon}</span>
{wallet.name}
</button>
))}
</div>
</div>

{/* Right Column - Info */}
<div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
<div>
<h3 style={{color: 'white', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem'}}>Qu'est-ce qu'un portefeuille?</h3>
								<p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: '1.6'}}>
									Un foyer pour vos actifs numériques. Les portefeuilles sont utilisés pour envoyer, recevoir, stocker et afficher des actifs numériques comme Ethereum et les NFTs.
								</p>
							</div>
							<div>
								<h3 style={{color: 'white', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem'}}>Une nouvelle façon de se connecter</h3>
								<p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: '1.6'}}>
									Au lieu de créer de nouveaux comptes et mots de passe sur chaque site Web, connectez simplement votre portefeuille.
								</p>
							</div>
							<a href="https://ethereum.org/fr/wallets/" target="_blank" rel="noopener noreferrer" style={{
								padding: '0.75rem 1.5rem',
								borderRadius: '2rem',
								background: '#3b82f6',
								color: 'white',
								textDecoration: 'none',
								fontSize: '0.875rem',
								fontWeight: 600,
								textAlign: 'center',
								transition: 'all 0.3s',
								cursor: 'pointer',
								display: 'inline-block'
							}}
							onMouseEnter={(e: any) => {
								e.currentTarget.style.background = '#2563eb';
								e.currentTarget.style.transform = 'scale(1.05)';
							}}
							onMouseLeave={(e: any) => {
								e.currentTarget.style.background = '#3b82f6';
								e.currentTarget.style.transform = 'scale(1)';
							}}
							>
								Obtenir un portefeuille
							</a>
						</div>
					</div>
				</div>
			</div>
		)}

							</div>
	);
})}

				{/* Pagination Controls */}
				{getTotalPages() > 1 && (
					<div style={{
						display: 'flex', 
						justifyContent: 'center', 
						alignItems: 'center', 
						gap: '1rem', 
						marginTop: '3rem',
						marginBottom: '2rem',
						padding: '1.5rem',
						background: 'rgba(255,255,255,0.03)',
						border: '1px solid rgba(255,255,255,0.08)',
						borderRadius: '1rem'
					}}>
						<button
							onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
							disabled={currentPage === 1}
							style={{
								padding: '0.75rem 1.25rem',
								borderRadius: '0.75rem',
								background: currentPage === 1 ? 'rgba(255,255,255,0.03)' : 'rgba(251,191,36,0.15)',
								border: '1px solid rgba(255,255,255,0.1)',
								color: currentPage === 1 ? 'rgba(255,255,255,0.3)' : '#fbbf24',
								cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
								fontWeight: 600,
								fontSize: '0.875rem',
								transition: 'all 0.3s',
								display: 'flex',
								alignItems: 'center',
								gap: '0.5rem'
							}}
						>
							<svg style={{width: '16px', height: '16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
							Previous
						</button>

						<div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
							{Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(pageNum => (
								<button
									key={pageNum}
									onClick={() => setCurrentPage(pageNum)}
									style={{
										width: '40px',
										height: '40px',
										borderRadius: '0.5rem',
										background: currentPage === pageNum ? 'linear-gradient(to right, #fbbf24, #f87171)' : 'rgba(255,255,255,0.05)',
										border: currentPage === pageNum ? 'none' : '1px solid rgba(255,255,255,0.1)',
										color: currentPage === pageNum ? 'black' : 'rgba(255,255,255,0.7)',
										cursor: 'pointer',
										fontWeight: currentPage === pageNum ? 700 : 600,
										fontSize: '0.875rem',
										transition: 'all 0.3s'
									}}
								>
									{pageNum}
								</button>
							))}
						</div>

						<button
							onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
							disabled={currentPage === getTotalPages()}
							style={{
								padding: '0.75rem 1.25rem',
								borderRadius: '0.75rem',
								background: currentPage === getTotalPages() ? 'rgba(255,255,255,0.03)' : 'rgba(251,191,36,0.15)',
								border: '1px solid rgba(255,255,255,0.1)',
								color: currentPage === getTotalPages() ? 'rgba(255,255,255,0.3)' : '#fbbf24',
								cursor: currentPage === getTotalPages() ? 'not-allowed' : 'pointer',
								fontWeight: 600,
								fontSize: '0.875rem',
								transition: 'all 0.3s',
								display: 'flex',
								alignItems: 'center',
								gap: '0.5rem'
							}}
						>
							Next
							<svg style={{width: '16px', height: '16px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</button>
					</div>
				)}
			</main>

			{/* Modal */}
			{selected && (
				<div
					className="lux-modal"
					onClick={() => { setSelected(null); setTradeMode(false); setTradeAddress(""); }}
					onWheel={(e: any) => e.stopPropagation()}
					onTouchMove={(e: any) => e.stopPropagation()}
				>
					<div
						className="lux-modal-content"
						onClick={(e: any) => e.stopPropagation()}
						role="dialog"
						aria-modal="true"
						aria-label={`Details for ${selected.label}`}
						style={{maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}
					>
						{/* Modal Header */}
						<div className="lux-modal-header" style={{flexShrink: 0}}>
							<div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
								<div style={{position: 'relative', width: '96px', height: '96px', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(168, 85, 247, 0.2))', border: '1px solid rgba(255,255,255,0.1)'}}>
									<span style={{fontSize: '3rem', fontWeight: 900, color: 'white', textShadow: '0 10px 30px rgba(0,0,0,0.5)'}}>{selected.label}</span>
								</div>

								<div>
									<div style={{fontSize: '2.25rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem'}}>{selected.label}</div>
									<p style={{fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', maxWidth: '400px', lineHeight: 1.6}}>
										{selected.description ?? `Unique number ID ${selected.id}`}
									</p>
									
									<div style={{display: 'flex', gap: '0.75rem', marginTop: '0.75rem'}}>
										<span style={{padding: '0.375rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(168, 85, 247, 0.3))', color: 'white', border: '1px solid rgba(251, 191, 36, 0.5)'}}>
											{selected.rarity}
										</span>
										{selected.owner && (
											<span style={{padding: '0.375rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(34,197,94,0.2)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)'}}>
												✓ Owned
											</span>
										)}
									</div>
								</div>
							</div>

							<button
								onClick={() => setSelected(null)}
								style={{width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'}}
								aria-label="Close"
							>
								<svg style={{width: '24px', height: '24px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Modal Body */}
						<div style={{padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', flexGrow: 1}}>
							{/* Stats Grid */}
							<div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
								{/* Price */}
								<div style={{borderRadius: '1rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem'}}>
									<div style={{fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem'}}>Price</div>
                                        <div style={{fontSize: '1.875rem', fontWeight: 900, background: 'linear-gradient(to right, #fcd34d, #d8b4fe)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                                        	{selected.priceEth} ETH
                                    	</div>
									<div style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem'}}>≈ ${(parseFloat(selected.priceEth) * 2000).toFixed(2)} USD</div>
								</div>

								{/* Owner */}
								<div style={{borderRadius: '1rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem'}}>
									<div style={{fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem'}}>Status</div>
									{selected.forSale ? (
										<div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
											<div style={{display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontSize: '0.875rem', fontWeight: 700, width: 'fit-content'}}>
												🔥 FOR SALE
											</div>
                                                <div style={{fontSize: '0.875rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)', wordBreak: 'break-all'}}>
                                                	Price: {selected.salePrice} ETH
                                            	</div>
											{/* Display seller's comment if it exists */}
											{saleContracts.find(c => c.numId === selected.id && c.status === 'active')?.comment && (
												<div style={{padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '2px solid rgba(16, 185, 129, 0.5)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)'}}>
													💬 Seller's note: "{saleContracts.find(c => c.numId === selected.id && c.status === 'active')?.comment}"
												</div>
											)}
										</div>
									) : selected.owner ? (
										<div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
											<div style={{fontSize: '0.875rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.9)', wordBreak: 'break-all'}}>
												{selected.owner.slice(0, 12)}...{selected.owner.slice(-8)}
											</div>
											{selected.owner.toLowerCase() === account?.toLowerCase() && (
												<div style={{display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', background: 'rgba(34,197,94,0.2)', color: '#86efac', fontSize: '0.75rem', fontWeight: 600}}>
													✓ You own this
												</div>
											)}
										</div>
									) : (
										<div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
											<div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', animation: 'pulse 2s infinite'}} />
											<span style={{fontSize: '0.875rem', fontWeight: 600, color: '#86efac'}}>Available Now</span>
										</div>
									)}
								</div>
							</div>

							{/* Actions */}
							<div>
								<div style={{fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem'}}>Actions</div>
								
								{!selected.owner && (!selected.isEasterEgg || (selected.isEasterEgg && selected.unlocked)) && (
									<div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
										<button
											onClick={() => { buyNumber(selected); setSelected(null); }}
											disabled={!networkCorrect}
											style={{width: '100%', padding: '1rem', borderRadius: '1rem', fontWeight: 700, fontSize: '1rem', background: 'linear-gradient(to right, #fbbf24, #f87171, #a855f7)', color: 'black', border: 'none', cursor: networkCorrect ? 'pointer' : 'not-allowed', opacity: networkCorrect ? 1 : 0.5, transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}
										>
											<svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
											</svg>
											Buy for {selected.priceEth} SEPOLIA
										</button>

										<button
										onClick={() => { setPromoItemId(selected.id); setShowPromoPopup(true); }}
										style={{width: '100%', padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem', background: 'linear-gradient(to right, #8b5cf6, #ec4899)', color: 'white', border: '1px solid rgba(168, 85, 247, 0.3)', cursor: 'pointer', transition: 'all 0.3s'}}
									>
										🎟️ Apply Promo Code
									</button>
									</div>
								)}

								{selected.forSale && selected.owner && selected.owner.toLowerCase() !== account?.toLowerCase() && (!selected.isEasterEgg || (selected.isEasterEgg && selected.unlocked)) && (
									<div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
										<button
											onClick={() => { buyNumber(selected); setSelected(null); }}
											disabled={!networkCorrect}
											style={{width: '100%', padding: '1rem', borderRadius: '1rem', fontWeight: 700, fontSize: '1rem', background: 'linear-gradient(to right, #fbbf24, #f87171, #a855f7)', color: 'black', border: 'none', cursor: networkCorrect ? 'pointer' : 'not-allowed', opacity: networkCorrect ? 1 : 0.5, transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}
										>
											<svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
											</svg>
											Buy for {selected.salePrice} SEPOLIA
										</button>

									</div>
								)}

								{/* ALWAYS SHOW: Mark as interested button and interested list */}
								<div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
									{/* Mark as interested button - Always visible */}
									{account && selected.owner && selected.owner.toLowerCase() !== account.toLowerCase() && (
										<button
											onClick={() => {
												const alreadyInterested = (selected.interestedBy || []).includes(account || '');
												if (alreadyInterested) {
													removeInterest(selected.id, account || '');
													setSelected({...selected, interestedCount: Math.max(0, (selected.interestedCount || 0) - 1), interestedBy: (selected.interestedBy || []).filter((addr: string) => addr !== account)});
												} else {
													setInterestedItemId(selected.id);
													setInterestedPrice("");
													setShowInterestPopup(true);
												}
											}}
											disabled={!account}
											style={{width: '100%', padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem', background: (selected.interestedBy || []).includes(account || '') ? 'linear-gradient(to right, #f87171, #fbbf24)' : 'rgba(255,255,255,0.05)', color: (selected.interestedBy || []).includes(account || '') ? 'white' : 'rgba(255,255,255,0.7)', border: (selected.interestedBy || []).includes(account || '') ? '1px solid rgba(248, 113, 113, 0.3)' : '1px solid rgba(255,255,255,0.1)', cursor: account ? 'pointer' : 'not-allowed', opacity: account ? 1 : 0.5, transition: 'all 200ms ease'}}
										>
											{(selected.interestedBy || []).includes(account || '') ? '❤️ You are interested' : '🤍 Mark as interested'} ({selected.interestedCount || 0})
										</button>
									)}

									{/* List of interested people - Always visible if there are interested people */}
									{(interestedByWithPrice[selected.id] || []).length > 0 && (
										<div style={{padding: '1rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginTop: '0.5rem'}}>
											<div style={{fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '0.75rem'}}>👥 Interested ({(interestedByWithPrice[selected.id] || []).length})</div>
											<div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto'}}>
												{(interestedByWithPrice[selected.id] || []).map((buyer: InterestedBuyer, idx: number) => (
													<div key={idx} style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.825rem'}}>
														<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
															<span style={{fontFamily: 'monospace', color: 'rgba(255,255,255,0.7)'}}>{buyer.address.slice(0, 10)}...{buyer.address.slice(-8)}</span>
															<span style={{color: '#fbbf24', fontWeight: 600}}>{buyer.priceEth} SEPOLIA</span>
														</div>
														{buyer.comment && (
															<div style={{padding: '0.5rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.03)', borderLeft: '2px solid rgba(251, 191, 36, 0.5)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal'}}>
																💬 "{buyer.comment}"
															</div>
														)}
													</div>
												))}
											</div>
										</div>
									)}
								</div>

								{selected.owner && account && selected.owner.toLowerCase() === account.toLowerCase() && (
									<div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
										{/* Boutons principaux - seulement Fixed Price */}
										<button
											onClick={() => setSelectedSaleMode(selectedSaleMode === "fixedPrice" ? null : "fixedPrice")}
											style={{padding: '0.75rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem', background: selectedSaleMode === "fixedPrice" ? 'linear-gradient(to right, #10b981, #14b8a6)' : 'rgba(255,255,255,0.05)', border: selectedSaleMode === "fixedPrice" ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', transition: 'all 0.3s', width: '100%'}}
										>
											💰 Fixed Price
										</button>

										{/* Mode: Prix fixe */}
										{selectedSaleMode === "fixedPrice" && (
											<div style={{padding: '1rem', borderRadius: '1rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.1))', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', flexDirection: 'column', gap: '0.75rem', animation: 'slideDown 0.3s ease-out'}}>
												<label style={{fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)'}}>
													Your price (SEPOLIA):
												</label>
												<input
													value={salePrice}
													onChange={(e: any) => setSalePrice(e.target.value)}
													placeholder="ex: 0.05"
													type="number"
													step="0.001"
													min="0"
													style={{width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'white', fontSize: '0.875rem', outline: 'none'}}
												/>
												<p style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', margin: '0.5rem 0 0 0'}}>
													You will receive: {salePrice ? parseFloat(salePrice).toFixed(4) : "0"} SEPOLIA
												</p>

												<label style={{fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginTop: '0.75rem'}}>
													Comment (Optional)
												</label>
												<textarea
													value={saleComment}
													onChange={(e: any) => setSaleComment(e.target.value)}
													placeholder="Add an optional message (e.g., 'Rare number, collector's item' or 'Limited time offer')"
													maxLength={300}
													style={{width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'white', fontSize: '0.875rem', outline: 'none', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical'}}
												/>
												<div style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textAlign: 'right'}}>
													{saleComment.length}/300
												</div>

												<button
													onClick={() => initiateNumberSale(selected, "fixedPrice", salePrice, saleComment)}
													style={{padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem', background: 'linear-gradient(to right, #10b981, #14b8a6)', color: 'white', border: 'none', cursor: 'pointer', transition: 'all 0.3s'}}
												>
													List for Sale
												</button>
											</div>
										)}

										{/* Cancel button if already for sale */}
										{selected.forSale && (
											<button
												onClick={() => cancelNumberSale(selected)}
												style={{padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer', transition: 'all 0.3s', width: '100%'}}
											>
												❌ Cancel Sale
											</button>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Promo Code Popup */}
			{showPromoPopup && (
				<div
					className="lux-modal"
					onClick={() => setShowPromoPopup(false)}
					onWheel={(e) => e.preventDefault()}
					onTouchMove={(e) => e.preventDefault()}
					style={{zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
				>
					<div
						className="lux-modal-content"
						onClick={(e: any) => e.stopPropagation()}
						onWheel={(e) => {
							const element = e.currentTarget;
							const isScrollable = element.scrollHeight > element.clientHeight;
							if (!isScrollable) {
								e.preventDefault();
							}
						}}
						onTouchMove={(e) => {
							const element = e.currentTarget as HTMLElement;
							const isScrollable = element.scrollHeight > element.clientHeight;
							if (!isScrollable) {
								e.preventDefault();
							}
						}}
						style={{maxWidth: '400px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '1rem', background: 'rgba(10, 10, 20, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', pointerEvents: 'auto'}}
					>
						<div className="lux-modal-header" style={{padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexShrink: 0}}>
							<div>
								<div style={{fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem'}}>🎟️ Promo Code</div>
								<p style={{fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', margin: 0}}>
									Enter a code to get a discount on {numbers.find(n => n.id === promoItemId)?.label}
								</p>
							</div>
							<button
								onClick={() => setShowPromoPopup(false)}
								style={{width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', flexShrink: 0}}
								aria-label="Close"
							>
								<svg style={{width: '24px', height: '24px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<div style={{padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', flexGrow: 1}}>
							<div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
								<label style={{fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)'}}>Promo Code</label>
								<input
									value={promoCode}
									onChange={(e: any) => setPromoCode(e.target.value)}
									placeholder="Enter promo code"
									type="text"
									style={{width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', outline: 'none', transition: 'all 0.3s', textTransform: 'uppercase'}}
									onFocus={(e) => {
										e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
										e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
									}}
									onBlur={(e) => {
										e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
										e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
									}}
								/>
							</div>
						</div>

						<div style={{padding: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '0.75rem', flexShrink: 0}}>
							<button
								onClick={() => setShowPromoPopup(false)}
								style={{flex: 1, padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 0.3s'}}
							>
								Cancel
							</button>
							<button
								onClick={() => {
									if (promoItemId) {
										const item = numbers.find(n => n.id === promoItemId);
										if (item) {
											applyPromoCode(item);
										}
									}
								}}
								style={{flex: 1, padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem', background: 'linear-gradient(to right, #8b5cf6, #ec4899)', color: 'white', border: 'none', cursor: 'pointer', transition: 'all 0.3s'}}
							>
								✅ Apply Code
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Popup Intérêt avec Prix */}
			{showInterestPopup && (
				<div
					className="lux-modal"
					onClick={() => setShowInterestPopup(false)}
					onWheel={(e) => e.preventDefault()}
					onTouchMove={(e) => e.preventDefault()}
					style={{zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
				>
					<div
						className="lux-modal-content"
						onClick={(e: any) => e.stopPropagation()}
						onWheel={(e) => {
							const element = e.currentTarget;
							const isScrollable = element.scrollHeight > element.clientHeight;
							if (!isScrollable) {
								e.preventDefault();
							}
						}}
						onTouchMove={(e) => {
							const element = e.currentTarget as HTMLElement;
							const isScrollable = element.scrollHeight > element.clientHeight;
							if (!isScrollable) {
								e.preventDefault();
							}
						}}
						style={{maxWidth: '400px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '1rem', background: 'rgba(10, 10, 20, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', pointerEvents: 'auto'}}
					>
						<div className="lux-modal-header" style={{padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexShrink: 0}}>
							<div>
								<div style={{fontSize: '1.5rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem'}}>Mark as Interested</div>
								<p style={{fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', margin: 0}}>
									At what price would you be interested in {numbers.find(n => n.id === interestedItemId)?.label}?
								</p>
							</div>
							<button
								onClick={() => setShowInterestPopup(false)}
								style={{width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', flexShrink: 0}}
								aria-label="Close"
							>
								<svg style={{width: '24px', height: '24px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<div style={{padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', flexGrow: 1}}>
							<div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
								<label style={{fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)'}}>Prix (SEPOLIA)</label>
								<input
									value={interestedPrice}
									onChange={(e: any) => setInterestedPrice(e.target.value)}
									placeholder="ex: 0.05"
									type="number"
									step="0.001"
									min="0"
									style={{width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', outline: 'none', transition: 'all 0.3s'}}
									onFocus={(e) => {
										e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.5)';
										e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
									}}
									onBlur={(e) => {
										e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
										e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
									}}
								/>
							</div>

							<div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
								<label style={{fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)'}}>Comment (Optional)</label>
								<textarea
									value={interestedComment}
									onChange={(e: any) => setInterestedComment(e.target.value)}
									placeholder="Add an optional message (e.g., 'Great number, would love to buy it!' or 'My max offer')"
									maxLength={300}
									style={{width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.875rem', outline: 'none', transition: 'all 0.3s', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical'}}
									onFocus={(e) => {
										e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.5)';
										e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
									}}
									onBlur={(e) => {
										e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
										e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
									}}
								/>
								<div style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textAlign: 'right'}}>
									{interestedComment.length}/300
								</div>
							</div>
						</div>

						<div style={{padding: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '0.75rem', flexShrink: 0}}>
							<button
								onClick={() => {
									setShowInterestPopup(false);
									setInterestedComment('');
								}}
								style={{flex: 1, padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 0.3s'}}
							>
								Cancel
							</button>
							<button
								onClick={() => {
									if (interestedItemId && account) {
										addInterestWithPrice(interestedItemId, account, interestedPrice, interestedComment);
										setShowInterestPopup(false);
										setInterestedComment('');
										if (selected?.id === interestedItemId) {
											setSelected({...selected, interestedCount: (selected.interestedCount || 0) + 1, interestedBy: [...(selected.interestedBy || []), account]});
										}
									}
								}}
								style={{flex: 1, padding: '0.75rem 1rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '0.875rem', background: 'linear-gradient(to right, #fbbf24, #f87171)', color: 'black', border: 'none', cursor: 'pointer', transition: 'all 0.3s'}}
							>
								✅ Confirm
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Floating Scroll Button */}
			<button
				onClick={() => {
					if (showScrollTop) {
						// Scroll to top
						window.scrollTo({ top: 0, behavior: 'smooth' });
					} else {
						// Scroll to footer
						document.querySelector('.lux-footer')?.scrollIntoView({ behavior: 'smooth' });
					}
				}}
				style={{
					position: 'fixed',
					bottom: '2rem',
					right: '2rem',
					width: '56px',
					height: '56px',
					borderRadius: '50%',
					background: 'linear-gradient(135deg, #fbbf24, #f87171)',
					border: '2px solid rgba(255,255,255,0.2)',
					color: 'white',
					cursor: 'pointer',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					boxShadow: '0 8px 32px rgba(251, 191, 36, 0.4)',
					transition: 'all 0.3s ease',
					zIndex: 1000,
					transform: 'scale(1)'
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.transform = 'scale(1.1)';
					e.currentTarget.style.boxShadow = '0 12px 40px rgba(251, 191, 36, 0.6)';
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.transform = 'scale(1)';
					e.currentTarget.style.boxShadow = '0 8px 32px rgba(251, 191, 36, 0.4)';
				}}
				title={showScrollTop ? 'Scroll to top' : 'Scroll to footer'}
			>
				<svg 
					style={{
						width: '24px', 
						height: '24px',
						transition: 'transform 0.3s ease',
						transform: showScrollTop ? 'rotate(180deg)' : 'rotate(0deg)'
					}} 
					fill="none" 
					stroke="currentColor" 
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
				</svg>
			</button>

			{/* Footer */}
			<footer className="lux-footer">
				<div className="lux-footer-content">
					<div style={{fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
						<div>
							<span style={{fontWeight: 600, color: 'rgba(255,255,255,0.7)'}}>Numberz</span> • Built on Sepolia Testnet
						</div>
						{currentChainId && (
							<div 
								style={{
									padding: '0.25rem 0.5rem', 
									borderRadius: '0.375rem', 
									background: currentChainId === BASE_CHAIN_ID ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)',
									border: `1px solid ${currentChainId === BASE_CHAIN_ID ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
									fontSize: '0.7rem',
									fontFamily: 'monospace',
									color: currentChainId === BASE_CHAIN_ID ? '#4ade80' : '#f87171'
								}}
								title={`Current Chain ID: ${currentChainId} (${parseInt(currentChainId, 16)})`}
							>
								{currentChainId === BASE_CHAIN_ID ? '✓ Base Mainnet' : `⚠ Chain: ${parseInt(currentChainId, 16)}`}
							</div>
						)}
					</div>
					<div className="lux-footer-links">
						<a href="#" style={{color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.75rem', transition: 'color 0.3s'}}>Documentation</a>
						<a href="#" style={{color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.75rem', transition: 'color 0.3s'}}>Smart Contract</a>
						<a href="#" style={{color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.75rem', transition: 'color 0.3s'}}>Support</a>
					</div>
				</div>
			</footer>

{/* Wallet Connection Modal */}
{showWalletModal && (
<div style={{
position: 'fixed',
inset: 0,
backgroundColor: 'rgba(0, 0, 0, 0.5)',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
zIndex: 10000,
backdropFilter: 'blur(4px)'
}} onClick={() => setShowWalletModal(false)}>
<div style={{
backgroundColor: '#0a0e27',
border: '1px solid rgba(255,255,255,0.1)',
borderRadius: '1.5rem',
padding: '2rem',
maxWidth: '900px',
width: '90%',
maxHeight: '90vh',
overflowY: 'auto',
boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
}} onClick={(e: any) => e.stopPropagation()}>
{/* Close Button */}
<button 
onClick={() => setShowWalletModal(false)}
style={{
position: 'absolute',
top: '1.5rem',
right: '1.5rem',
width: '40px',
height: '40px',
borderRadius: '50%',
background: 'rgba(255,255,255,0.05)',
border: '1px solid rgba(255,255,255,0.1)',
color: 'rgba(255,255,255,0.7)',
cursor: 'pointer',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
transition: 'all 0.3s'
}}
onMouseEnter={(e: any) => {
e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
}}
onMouseLeave={(e: any) => {
e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
}}
>
✕
</button>

<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start'}}>
{/* Left Column - Wallets */}
<div>
<h2 style={{color: 'white', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem'}}>Connecter un portefeuille</h2>
<div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
{[
{ name: 'MetaMask', icon: '🦊' },
{ name: 'WalletConnect', icon: '🌐' },
{ name: 'Ledger', icon: '🔐' },
{ name: 'Coinbase Wallet', icon: '◯' },
{ name: 'Rainbow', icon: '🌈' }
].map((wallet) => (
<button
key={wallet.name}
onClick={() => {
setShowWalletModal(false);
connectWallet();
}}
style={{
padding: '1rem',
borderRadius: '0.75rem',
background: 'rgba(255,255,255,0.05)',
border: '1px solid rgba(255,255,255,0.1)',
color: 'white',
fontSize: '1rem',
fontWeight: 500,
cursor: 'pointer',
display: 'flex',
alignItems: 'center',
gap: '1rem',
transition: 'all 0.3s',
textAlign: 'left'
}}
onMouseEnter={(e: any) => {
e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.4)';
}}
onMouseLeave={(e: any) => {
e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
}}
>
<span style={{fontSize: '1.5rem'}}>{wallet.icon}</span>
{wallet.name}
</button>
))}
</div>
</div>

{/* Right Column - Info */}
<div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
<div>
<h3 style={{color: 'white', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem'}}>Qu'est-ce qu'un portefeuille?</h3>
								<p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: '1.6'}}>
									Un foyer pour vos actifs numériques. Les portefeuilles sont utilisés pour envoyer, recevoir, stocker et afficher des actifs numériques comme Ethereum et les NFTs.
								</p>
							</div>
							<div>
								<h3 style={{color: 'white', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem'}}>Une nouvelle façon de se connecter</h3>
								<p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: '1.6'}}>
									Au lieu de créer de nouveaux comptes et mots de passe sur chaque site Web, connectez simplement votre portefeuille.
								</p>
							</div>
							<a href="https://ethereum.org/fr/wallets/" target="_blank" rel="noopener noreferrer" style={{
								padding: '0.75rem 1.5rem',
								borderRadius: '2rem',
								background: '#3b82f6',
								color: 'white',
								textDecoration: 'none',
								fontSize: '0.875rem',
								fontWeight: 600,
								textAlign: 'center',
								transition: 'all 0.3s',
								cursor: 'pointer',
								display: 'inline-block'
							}}
							onMouseEnter={(e: any) => {
								e.currentTarget.style.background = '#2563eb';
								e.currentTarget.style.transform = 'scale(1.05)';
							}}
							onMouseLeave={(e: any) => {
								e.currentTarget.style.background = '#3b82f6';
								e.currentTarget.style.transform = 'scale(1)';
							}}
							>
								Obtenir un portefeuille
							</a>
						</div>
					</div>
				</div>
			</div>
		)}

		</div>
	);
}
