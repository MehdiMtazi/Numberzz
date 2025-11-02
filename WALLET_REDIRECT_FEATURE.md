# Wallet Installation Redirect Feature

## Overview
When users without installed wallets attempt to connect, they are now automatically redirected to the official installation pages for the respective wallet providers.

## Implementation

### Wallet Configuration
A `walletConfig` object has been added to `app/page.tsx` that includes:
- **Icon**: Emoji representation of each wallet
- **Installation URL**: Official download/installation page
- **Detection function**: Checks if the wallet is already installed

### Supported Wallets

| Wallet | Icon | Installation URL |
|--------|------|-----------------|
| MetaMask | 🦊 | https://metamask.io/download/ |
| WalletConnect | 🌐 | https://walletconnect.com/ |
| Ledger | 🔐 | https://www.ledger.com/ledger-live |
| Coinbase Wallet | ◯ | https://www.coinbase.com/wallet |
| Rainbow | 🌈 | https://rainbow.me/ |

### How It Works

1. **Detection**: When a user clicks on a wallet option, the `handleWalletClick()` function checks if the wallet is installed
   - For MetaMask: Checks for `window.ethereum.isMetaMask`
   - For Coinbase Wallet: Checks for `window.ethereum.isCoinbaseWallet`
   - For Rainbow: Checks for `window.ethereum.isRainbow`
   - For Ledger: Checks for generic `window.ethereum`
   - For WalletConnect: Always available (it's a protocol, not an extension)

2. **Action**:
   - **If installed**: Closes the modal and proceeds with wallet connection
   - **If not installed**: Opens the official installation page in a new tab

### Code Structure

```typescript
// Wallet configuration with detection and URLs
const walletConfig = {
  'MetaMask': {
    icon: '🦊',
    installUrl: 'https://metamask.io/download/',
    detect: () => typeof (window as any).ethereum?.isMetaMask !== 'undefined'
  },
  // ... other wallets
};

// Handler function
const handleWalletClick = (walletName: string) => {
  const wallet = walletConfig[walletName];
  if (wallet.detect()) {
    // Connect to installed wallet
    setShowWalletModal(false);
    connectWallet();
  } else {
    // Redirect to installation page
    window.open(wallet.installUrl, '_blank');
  }
};
```

### Updated Components

All three wallet modals in the application have been updated:
1. Main navigation modal (line ~1424)
2. Number detail modal (line ~2266)
3. Footer modal (line ~3057)

Each modal now uses:
```tsx
{Object.entries(walletConfig).map(([name, config]) => (
  <button key={name} onClick={() => handleWalletClick(name)}>
    <span>{config.icon}</span>
    {name}
  </button>
))}
```

## User Experience

### Before
- Users without wallets would see an error or no response when clicking wallet options
- No clear path to install wallets

### After
- Users are automatically directed to official installation pages
- New tab opens with the wallet's download page
- Seamless onboarding experience for new crypto users

## Benefits

1. **Better UX**: Clear path for users new to Web3
2. **Official sources**: Only links to official wallet websites
3. **Security**: Users are directed to legitimate sources, reducing phishing risk
4. **Convenience**: One-click access to wallet installation
5. **Automatic detection**: No manual selection needed - the app detects what's already installed

## Notes

- Links open in new tabs (`_blank`) to preserve the application state
- Detection is performed client-side using `window.ethereum` properties
- WalletConnect doesn't require detection as it's a connection protocol, not a browser extension
- The modal remains open when redirecting to installation pages (users can return after installing)
