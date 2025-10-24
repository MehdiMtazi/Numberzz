# 🔢 Numberz - NFT Collection Trading Platform

A Web3-powered NFT collection app where users can discover, buy, sell, and trade unique numbers with dynamic pricing, interested buyer tracking, and Easter eggs.

## ✨ Features

### 🎯 Core Functionality
- **Browse & Search**: Discover numbers by ID, label, or description with real-time search
- **Smart Rarity System**: Auto-generated rarity tiers based on mathematical properties:
  - **Legendary** & **Exotic**: Special Easter eggs
  - **Rare**: Prime numbers (2, 3, 5, 7, 11, 13...)
  - **Uncommon**: Perfect numbers, powers, Fibonacci sequences (6, 28, 32, 64, 89...)
  - **Common**: Regular integers
- **Dynamic Pricing**: Each rarity tier has different base prices
- **Ownership System**: Connect MetaMask wallet and purchase numbers to become the owner

### 💰 Trading Features
- **Fixed Price Sales**: Owners can list numbers "FOR SALE" at a fixed price
- **Cancel Listings**: Sellers can cancel their sale offer before someone buys
- **Interest Tracking**: Other users can mark themselves as "Interested" and propose prices
- **Visible Interested Buyers List**: All visitors can see who's interested and at what price
- **Ownership Transfer**: Buyers automatically gain ownership rights after purchase
- **Smart Funds Routing**: 
  - If buying from owner: payment goes to seller
  - If buying new: payment goes to bank wallet (0x5Fd31d...)

### 🎪 Easter Eggs 🥚
7 special numbers with unique abilities:

**Free Easter Eggs** (claim immediately):
- 🎭 **Darius** (42) - Legendary
- 🌈 **Nyan** (256) - Exotic  
- 🎨 **Chroma** (69) - Rare

**Premium Easter Eggs** (unlock after purchases):
- 🦍 **Wukong** (72) - Requires finding secret
- ⚫ **Half-Life** (17) - Requires ownership milestone
- 💾 **Meme** (666) - Requires community interaction
- 🔮 **Secret** (????) - Hidden location

See [Easter Eggs Guide](http://localhost:3000/easter-eggs) for complete details!

### 🔍 Advanced Filtering
- **All**: View entire collection
- **Available**: Unowned numbers only
- **My Numbers**: Your owned collection
- **Owned by Others**: Numbers owned by other users
- **🔥 For Sale**: Only numbers listed for sale

### 📊 Sorting Options
- Price ↑ (ascending)
- Price ↓ (descending)
- Rarity (Legendary → Common)
- Most Interested (popularity)

### 🏆 Achievements System
Unlock achievements as you interact with the platform:
- First purchase, milestone collections, Easter egg discoveries, etc.

### ✅ Data Persistence
- **localStorage Integration**: All data persists across page refreshes
- **Cross-Tab Synchronization**: Changes sync automatically between browser tabs using BroadcastChannel API
- **Smart Error Handling**: Automatic recovery from corrupted data
- **SSR Compatible**: Proper Next.js hydration handling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask wallet extension
- Sepolia testnet ETH (for testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/bilfrux/Numberzz2.git
cd NumberzzV2

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect your MetaMask wallet.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15.3.4 + React 18
- **Language**: TypeScript
- **Styling**: CSS Modules + Inline Styles
- **State Management**: React Hooks + localStorage
- **Web3**: Direct MetaMask Ethereum API
- **Network**: Sepolia Testnet (Chain ID: 0xaa36a7)

### Project Structure
```
app/
├── page.tsx              # Main component (≈1900 lines)
├── layout.tsx            # Root layout
├── globals.css           # Global styles
├── page.module.css       # Component styles
├── rootProvider.tsx      # Provider wrapper
├── easter-eggs/
│   └── page.tsx          # Easter eggs guide
└── api/
    └── auth/
        └── route.ts      # Authentication endpoint
```

### Data Models

**NumItem** (Number):
```typescript
{
  id: string;
  label: string;
  rarity: "Legendary" | "Rare" | "Uncommon" | "Common" | "Exotic";
  priceEth: string;
  owner: string | null;
  description?: string;
  interestedCount?: number;
  interestedBy?: string[];
  isEasterEgg?: boolean;
  easterEggName?: string;
  forSale?: boolean;      // Listed at fixed price
  salePrice?: string;     // Fixed sale price
}
```

**SaleContract**:
```typescript
{
  id: string;
  numId: string;
  seller: string;
  mode: "fixedPrice" | "buyOffer";
  priceEth?: string;
  createdAt: number;
  status: "active" | "pending" | "completed" | "cancelled";
}
```

### localStorage Keys
- `numberz_numbers`: All numbers data
- `numberz_contracts`: Active sale contracts
- `numberz_certs`: Ownership certificates
- `numberz_interested`: Interested buyers with prices
- `numberz_achievements`: User achievements

## 🔐 Admin Features

### Emergency Clear (Admin Only)
Bank wallet (0x5Fd31d...) can:
- Clear all numbers, contracts, certificates, and interested records
- Two-step verification required
- Auto-page refresh after completion

## 🐛 Known Issues & Solutions

**Issue**: Numbers disappear after purchase on page refresh
- **Solution**: Enhanced localStorage validation and error recovery (v1.1+)

**Issue**: Hydration mismatch on SSR
- **Solution**: useHydrated hook defers rendering until client hydration (v1.1+)

**Issue**: Data corruption from parallel writes
- **Solution**: Improved error handling with fallback cache clearing (v1.1+)

## 🔄 Recent Updates (v1.1)

✅ **Cancel Sale Button**: Owners can now cancel "FOR SALE" listings
✅ **For Sale Filter**: New filter to show only numbers listed for sale
✅ **Interested Buyers Visibility**: All users can see interested buyers list, not just owners
✅ **English Translations**: Changed status to "FOR SALE" (from "EN VENTE")
✅ **Better Data Persistence**: Enhanced localStorage error handling and validation
✅ **Cross-Tab Sync Fixes**: Eliminated infinite update loops

## 📝 Usage Examples

### Connect Wallet
1. Click "Connect Wallet" button
2. Select MetaMask
3. Approve connection request
4. Ensure you're on Sepolia network

### Buy a Number
1. Browse available numbers or click on one
2. Click "Buy for X ETH"
3. Confirm transaction in MetaMask
4. Number appears in your collection

### Sell a Number
1. View your number in "My Numbers" filter
2. Click "💰 Fixed Price"
3. Enter your desired price
4. Click "Mettre en vente" (Put for sale)
5. Buyers can now purchase at your price

### Mark as Interested
1. View any number
2. Click "🤍 Mark Interested"
3. Enter your proposed price
4. Seller can see you in the "Interested" list

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**bilfrux** - [GitHub Profile](https://github.com/bilfrux)

## 🔗 Links

- Live Demo: [Coming Soon]
- Easter Eggs Guide: [http://localhost:3000/easter-eggs](http://localhost:3000/easter-eggs)
- MetaMask: [https://metamask.io](https://metamask.io)
- Next.js Docs: [https://nextjs.org/docs](https://nextjs.org/docs)

---

**Built with ❤️ for the Web3 community**
