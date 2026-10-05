export interface IntroSection {
  id: string;
  title: string;
  badge: string;
  summary: string;
  content: string[];
  keyPoints?: string[];
  diagramType?: "blockchain_flow" | "transaction_lifecycle" | "pow_vs_pos" | "wallet_types" | "tokens_vs_coins";
}

export const INTRO_SECTIONS: IntroSection[] = [
  {
    id: "what-is-crypto",
    title: "1. What is Cryptocurrency?",
    badge: "Core Concept",
    summary:
      "A decentralized digital currency secured by cryptographic mathematics rather than physical paper or centralized banking authorities.",
    content: [
      "Cryptocurrency is a form of digital or virtual currency that relies on cryptographic techniques to secure transactions, control the creation of additional units, and verify the transfer of assets.",
      "Unlike traditional fiat currencies (like the Indian Rupee, US Dollar, or Euro), cryptocurrencies are not issued by any sovereign government or central bank, which makes them theoretically immune to government manipulation, arbitrary printing, or centralized interference.",
      "Most cryptocurrencies operate on decentralized networks based on blockchain technology—a distributed ledger enforced by a disparate network of computers (nodes) across the globe.",
    ],
    keyPoints: [
      "Decentralized: No single entity, bank, or government has unilateral control.",
      "Cryptographically Secured: Uses asymmetric public-key cryptography and hash functions.",
      "Permissionless & Borderless: Anyone with an internet connection can send and receive value globally.",
      "Immutable Records: Once verified, transactions cannot be retroactively altered or deleted.",
    ],
  },
  {
    id: "what-is-blockchain",
    title: "2. What is Blockchain Technology?",
    badge: "Architecture",
    summary:
      "A distributed, tamper-evident digital ledger that securely records transactions across a peer-to-peer network.",
    content: [
      "A blockchain is literally a chain of digital 'blocks' containing data. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data.",
      "Because each block links cryptographically to the block preceding it, altering any past transaction would require re-mining every subsequent block across the majority of the decentralized network—making unauthorized tampering computationally unfeasible.",
      "Consensus mechanisms (such as Proof of Work or Proof of Stake) ensure that every node on the network agrees on the exact chronological state of the ledger.",
    ],
    diagramType: "blockchain_flow",
    keyPoints: [
      "Distributed Ledger: Replicated across thousands of independent validator nodes.",
      "Cryptographic Hash Linking: SHA-256 or Keccak-256 produces unique, irreversible digital fingerprints.",
      "Tamper-Resistant: Altering historical blocks breaks mathematical links down the chain.",
    ],
  },
  {
    id: "how-transactions-work",
    title: "3. How Cryptocurrency Transactions Work",
    badge: "Transaction Flow",
    summary:
      "A cryptographic handshake where a sender signs a state change using their private key, broadcasted to the network for validation.",
    content: [
      "When Alice wishes to send Bitcoin or Ethereum to Bob, she initiates a transfer specifying Bob's public address and the amount.",
      "Alice's wallet creates a digital signature using her secret Private Key. This mathematical signature proves ownership of the funds without ever exposing the private key itself.",
      "The signed transaction is broadcast to the network's Memory Pool (Mempool), where validators verify signature validity, account balance, and nonce.",
      "Validators bundle the transaction into a new block, achieve consensus, and permanently append the block to the ledger. Bob sees the incoming balance confirmed.",
    ],
    diagramType: "transaction_lifecycle",
    keyPoints: [
      "Public Key / Address: Functions like an account number you share publicly.",
      "Private Key: Functions like a master cryptographic signature that must never be revealed.",
      "Gas / Network Fees: Compensate miners/validators for computational energy and bandwidth.",
    ],
  },
  {
    id: "wallets",
    title: "4. What is a Cryptocurrency Wallet?",
    badge: "Storage & Custody",
    summary:
      "A digital tool that manages your cryptographic keys, letting you interact with blockchains to view balances and sign transfers.",
    content: [
      "A common misconception is that crypto wallets 'store' coins. In reality, all coins reside on the decentralized blockchain. Your wallet simply stores the Private Keys and Public Keys needed to prove ownership and authorize transfers.",
      "Wallets are categorized into 'Hot Wallets' (connected to the internet for convenient everyday trading) and 'Cold Wallets' (offline hardware devices providing physical isolation from malware and hackers).",
      "Non-custodial wallets give you 100% control over your 12-to-24 word Secret Recovery Phrase (Seed Phrase). If lost, no customer support can retrieve it ('Not your keys, not your coins').",
    ],
    diagramType: "wallet_types",
    keyPoints: [
      "Cold Hardware Wallets (Ledger, Trezor): Maximum security, offline key generation.",
      "Hot Software Wallets (MetaMask, Phantom): Browser extensions and mobile apps for Web3.",
      "Seed Phrase: The cryptographic root (BIP-39) that derives all private keys and addresses.",
    ],
  },
  {
    id: "mining-and-consensus",
    title: "5. What is Mining & Consensus?",
    badge: "Consensus Mechanism",
    summary:
      "The agreement protocols that allow decentralized computers to coordinate truth without a trusted central server.",
    content: [
      "In traditional finance, a bank verifies whether you have enough money. In cryptocurrency, consensus algorithms perform this role trustlessly.",
      "Proof of Work (PoW): Used by Bitcoin. Specialized computers (ASICs) expend enormous computational power solving cryptographic puzzles to earn the right to propose the next block and receive newly minted coins.",
      "Proof of Stake (PoS): Used by Ethereum and Solana. Validators lock up ('stake') collateral tokens. The protocol randomly selects validators to propose and attest to blocks. Malicious behavior results in collateral destruction ('slashing').",
    ],
    diagramType: "pow_vs_pos",
    keyPoints: [
      "PoW (Proof of Work): Secured by computational physics, energy consumption, and high capital hardware.",
      "PoS (Proof of Stake): Secured by economic stake, 99.9% more energy efficient, rewards stakers with yields.",
      "51% Attack Threshold: Consensus ensures that seizing control requires over half the global computational hash rate or staked capital.",
    ],
  },
  {
    id: "tokens-vs-coins",
    title: "6. Tokens vs Coins: Understanding the Difference",
    badge: "Asset Classification",
    summary:
      "Coins are the native fuel of independent blockchains, while tokens are created on top of existing smart contract blockchains.",
    content: [
      "Crypto Coins (e.g., BTC on Bitcoin, ETH on Ethereum, SOL on Solana, BNB on BNB Chain) operate on their own sovereign Layer 1 blockchain. They are primarily used to pay transaction fees (gas) and secure network consensus.",
      "Crypto Tokens (e.g., USDT, UNI, LINK, AAVE) do not have their own standalone blockchain. Instead, they are minted via smart contracts following standards like ERC-20 (Ethereum) or SPL (Solana).",
      "While a coin serves as base network currency, tokens can represent anything: stablecoins, governance voting shares, utility credits, or tokenized real-world assets.",
    ],
    diagramType: "tokens_vs_coins",
    keyPoints: [
      "Layer 1 Native Coin: Has its own network protocol and miners/validators (BTC, ETH, SOL, BNB).",
      "Smart Contract Token: Uses the security and ledger of the parent chain (USDT on Ethereum/Tron).",
      "Standards: ERC-20, BEP-20, SPL ensure cross-compatibility with wallets and decentralized exchanges.",
    ],
  },
  {
    id: "market-capitalization",
    title: "7. What is Market Capitalization?",
    badge: "Valuation Metric",
    summary:
      "The total aggregate market value of a cryptocurrency's circulating supply, calculated as Current Price × Circulating Supply.",
    content: [
      "A common beginner mistake is looking only at unit price (e.g., assuming a coin priced at ₹10 is 'cheaper' than a coin priced at ₹10,000). Market capitalization provides the true scale of an asset.",
      "Market Cap = Current Unit Price × Circulating Supply.",
      "Large-Cap (> ₹1 Lakh Crore): Bitcoin, Ethereum. Established track record, high institutional liquidity, and lower comparative volatility.",
      "Mid & Small-Cap: Higher potential growth upside balanced by severe drawdown risk and vulnerability to market manipulation.",
    ],
    keyPoints: [
      "Price alone is misleading; always evaluate supply scale.",
      "Circulating Supply: Number of coins currently tradeable in public hands.",
      "Fully Diluted Valuation (FDV): The market cap if the maximum future supply was unlocked today.",
    ],
  },
  {
    id: "volatility",
    title: "8. What Causes Cryptocurrency Volatility?",
    badge: "Market Dynamics",
    summary:
      "Rapid price swings driven by 24/7 continuous trading, speculative sentiment, liquidity depth, and regulatory developments.",
    content: [
      "Cryptocurrency markets operate 24 hours a day, 7 days a week, 365 days a year across hundreds of global exchanges with zero market open/close pauses or circuit breakers.",
      "Because crypto assets are emerging technologies undergoing global price discovery, their perceived valuation shifts dramatically based on macroeconomic interest rates, regulatory announcements, technological breakthroughs, and media coverage.",
      "High leverage in perpetual futures markets can trigger cascading liquidations (long squeezes or short squeezes), amplifying intraday swings.",
    ],
    keyPoints: [
      "24/7 Global Trading: No market halts or weekend closures.",
      "Derivatives & Leverage: Cascading liquidations create sudden sharp spikes and flash crashes.",
      "Macro & Regulatory Sensitivity: Sensitive to central bank interest rate cycles and jurisdictional laws.",
    ],
  },
  {
    id: "advantages-disadvantages",
    title: "9. Advantages & Disadvantages Matrix",
    badge: "Balanced Analysis",
    summary:
      "An objective look at the transformative benefits versus the operational challenges of decentralized digital currencies.",
    content: [
      "Understanding cryptocurrency requires an honest assessment of both its revolutionary strengths and its current real-world limitations.",
    ],
    keyPoints: [
      "Advantage: Financial Sovereignty - True self-custody with zero risk of unilateral account freezing.",
      "Advantage: Global Borderless Payments - Settle billions in value across borders in minutes with minimal fees.",
      "Advantage: Programmable Financial Contracts - Automated escrow, lending, and yield protocols without intermediaries.",
      "Disadvantage: Irreversibility - If funds are sent to an incorrect address or stolen, transactions cannot be reversed.",
      "Disadvantage: High Volatility - Rapid valuation fluctuations make everyday pricing challenging.",
      "Disadvantage: Self-Custody Responsibility - Losing your private seed phrase results in permanent, unrecoverable loss.",
    ],
  },
  {
    id: "risks-and-security",
    title: "10. Major Risks & Security Essentials",
    badge: "Risk Management",
    summary:
      "Critical risks every participant must navigate: smart contract exploits, phishing, market drawdowns, and regulatory shifts.",
    content: [
      "Cryptocurrency is an adversarial environment. Security starts with understanding where risks originate.",
      "1. Market Risk: Cryptocurrencies can experience 50% to 85% drawdowns during cyclical bear markets. Never allocate funds you cannot afford to lose.",
      "2. Phishing & Social Engineering: Fake exchange websites, malicious Discord/Telegram DMs, and deceptive signing requests.",
      "3. Smart Contract Exploits: Code bugs in decentralized protocols can lead to protocol drain.",
      "4. Custodial / Exchange Risk: Centralized exchanges can suffer insolvency or frozen withdrawals ('Not your keys, not your coins').",
    ],
    keyPoints: [
      "Rule 1: Never share your 12/24-word seed phrase with ANY person, website, or customer support.",
      "Rule 2: Use hardware wallets for long-term reserves; keep minimal capital on centralized exchanges.",
      "Rule 3: Always double-check transaction recipient addresses and check for clipboard hijacking malware.",
      "Rule 4: Verify smart contract approvals using revocation tools (e.g., Revoke.cash).",
    ],
  },
];
