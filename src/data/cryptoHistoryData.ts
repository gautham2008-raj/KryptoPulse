import { CryptoCoinHistoryInfo } from "../types/crypto";

export const CRYPTO_HISTORIES: Record<string, CryptoCoinHistoryInfo> = {
  bitcoin: {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    launchDate: "January 3, 2009",
    founder: "Satoshi Nakamoto",
    foundingOrg: "Decentralized Open Source Community",
    originalPurpose:
      "A peer-to-peer electronic cash system enabling trustless online payments without financial intermediaries or central authorities.",
    consensus: "Proof of Work (PoW) - SHA-256",
    tps: "7 TPS",
    avgFeeINR: "₹180 - ₹450",
    color: "#f7931a",
    gradient: "from-amber-500 to-orange-600",
    currentRole:
      "Acts as the digital reserve asset ('Digital Gold') and benchmark settlement store-of-value for the global digital economy, widely adopted by institutional treasuries, sovereign states, and spot ETFs.",
    milestones: [
      {
        year: "2008",
        title: "Whitepaper Published",
        description:
          "Satoshi Nakamoto published 'Bitcoin: A Peer-to-Peer Electronic Cash System' on the cryptography mailing list on October 31, 2008.",
        category: "launch",
      },
      {
        year: "2009",
        title: "Genesis Block Mined",
        description:
          "Block 0 was mined on Jan 3, 2009, embedding the famous Times headline: 'Chancellor on brink of second bailout for banks'.",
        category: "launch",
      },
      {
        year: "2010",
        title: "First Commercial Purchase",
        description:
          "Laszlo Hanyecz bought two pizzas for 10,000 BTC on May 22, establishing the first real-world trade price.",
        category: "event",
      },
      {
        year: "2012 - 2024",
        title: "The Halving Cycles",
        description:
          "Four halving events (2012, 2016, 2020, and April 2024) systematically reduced block rewards from 50 BTC down to 3.125 BTC.",
        category: "milestone",
      },
      {
        year: "2017",
        title: "SegWit & Lightning Network",
        description:
          "Segregated Witness was activated to fix transaction malleability and enable second-layer micro-payments via Lightning.",
        category: "upgrade",
      },
      {
        year: "2021",
        title: "Taproot Soft Fork & El Salvador",
        description:
          "Taproot improved privacy and smart contract flexibility; El Salvador became the first nation to adopt Bitcoin as legal tender.",
        category: "upgrade",
      },
      {
        year: "2024",
        title: "US Spot Bitcoin ETFs Approved",
        description:
          "SEC approved 11 spot Bitcoin ETFs, opening access to trillions in registered global wealth management capital.",
        category: "milestone",
      },
    ],
    majorDevelopments: [
      "Inception of programmatic digital scarcity capped strictly at 21,000,000 coins",
      "Ordinals and Runes bringing decentralized inscriptions and token standards to Layer 1",
      "Institutional treasury adoption led by MicroStrategy, BlackRock, and global sovereign funds",
      "Layer-2 scaling maturation via the Lightning Network and Liquid Network",
    ],
  },
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    launchDate: "July 30, 2015",
    founder: "Vitalik Buterin, Gavin Wood, Charles Hoskinson & co-founders",
    foundingOrg: "Ethereum Foundation",
    originalPurpose:
      "A decentralized global computing platform (Turing-complete world computer) executing tamper-proof smart contracts and decentralized applications (dApps).",
    consensus: "Proof of Stake (PoS) - Casper / Beacon Chain",
    tps: "15 - 30 TPS (L1) / 1000+ (L2 Rollups)",
    avgFeeINR: "₹40 - ₹280",
    color: "#627eea",
    gradient: "from-blue-500 to-indigo-600",
    currentRole:
      "The foundational settlement layer for decentralized finance (DeFi), NFTs, tokenized real-world assets (RWAs), and decentralized identity.",
    milestones: [
      {
        year: "2013",
        title: "Vitalik Publishes Whitepaper",
        description:
          "Vitalik Buterin conceived Ethereum to expand blockchain beyond currency into programmable distributed computation.",
        category: "launch",
      },
      {
        year: "2015",
        title: "Frontier Genesis Launch",
        description:
          "The first live release of the Ethereum network went live on July 30, 2015, introducing the Ethereum Virtual Machine (EVM).",
        category: "launch",
      },
      {
        year: "2016",
        title: "The DAO Fork & Ethereum Classic",
        description:
          "A critical exploit in The DAO led the community to hard-fork to recover stolen funds, creating modern Ethereum and Ethereum Classic.",
        category: "event",
      },
      {
        year: "2020",
        title: "DeFi Summer & Beacon Chain",
        description:
          "Decentralized lending and automated market makers exploded; Beacon Chain launched Phase 0 of the transition to PoS.",
        category: "milestone",
      },
      {
        year: "2021",
        title: "EIP-1559 Fee Burn",
        description:
          "London Hard Fork introduced base fee burning, making ETH net-deflationary during periods of elevated network activity.",
        category: "upgrade",
      },
      {
        year: "2022",
        title: "The Merge",
        description:
          "Historic transition from Proof of Work to Proof of Stake, slashing network electrical energy consumption by 99.95%.",
        category: "upgrade",
      },
      {
        year: "2024",
        title: "Dencun Upgrade & Blob Transactions",
        description:
          "EIP-4844 introduced 'blobs', dropping Layer-2 rollup transaction fees by over 90% across Arbitrum, Optimism, and Base.",
        category: "upgrade",
      },
    ],
    majorDevelopments: [
      "Pioneered Smart Contracts and ERC-20 / ERC-721 token standards",
      "Transition from energy-intensive Proof of Work to Proof of Stake via The Merge",
      "Rollup-centric roadmap scaling via Zero-Knowledge (ZK) and Optimistic L2 rollups",
      "US Spot Ethereum ETFs approved by the SEC in 2024",
    ],
  },
  tether: {
    id: "tether",
    name: "Tether",
    symbol: "USDT",
    launchDate: "October 6, 2014",
    founder: "Brock Pierce, Reeve Collins, and Craig Sellars",
    foundingOrg: "Tether Limited (iFinex Inc.)",
    originalPurpose:
      "A fiat-collateralized digital token pegged 1:1 to the US Dollar, facilitating liquidity, arbitrage, and cross-border settlement without fiat banking delays.",
    consensus: "Multi-Chain Token (Omni, Ethereum ERC-20, Tron TRC-20, Solana SPL)",
    tps: "Depends on host chain (Ethereum ~15, Tron ~2000, Solana ~3000)",
    avgFeeINR: "₹8 (Tron/SOL) to ₹150 (ETH)",
    color: "#26a17b",
    gradient: "from-emerald-500 to-teal-600",
    currentRole:
      "The undisputed global stablecoin liquidity backbone, accounting for the highest daily trading volume in crypto and serving as digital dollars in emerging economies.",
    milestones: [
      {
        year: "2014",
        title: "Launched as Realcoin",
        description:
          "Founded in Santa Monica and initially built on Bitcoin's Omni Layer protocol before rebranding to Tether (USDT).",
        category: "launch",
      },
      {
        year: "2017",
        title: "Expansion to Ethereum",
        description:
          "Issued as an ERC-20 token on Ethereum, sparking rapid growth in liquidity across emerging decentralized exchanges.",
        category: "milestone",
      },
      {
        year: "2019",
        title: "Tron Integration",
        description:
          "Launched on the Tron blockchain (TRC-20), drastically lowering transaction fees and becoming dominant in cross-border commerce.",
        category: "upgrade",
      },
      {
        year: "2021",
        title: "Reserve Transparency Audits",
        description:
          "Began publishing quarterly attestation reports certified by independent accounting firms, rotating reserves heavily into US Treasuries.",
        category: "event",
      },
      {
        year: "2024",
        title: "Crossed $120 Billion Market Cap",
        description:
          "Solidified position as the world's most traded cryptocurrency asset, holding more US Treasury bills than many sovereign nations.",
        category: "milestone",
      },
    ],
    majorDevelopments: [
      "Over 80% of reserves backed by ultra-safe short-dated US Treasury Bills and cash equivalents",
      "Multi-chain availability across Ethereum, Tron, Solana, Avalanche, TON, and Arbitrum",
      "Crucial hedge against local currency inflation across Asia, Latin America, and Africa",
    ],
  },
  binancecoin: {
    id: "binancecoin",
    name: "BNB",
    symbol: "BNB",
    launchDate: "July 2017",
    founder: "Changpeng Zhao (CZ) & He Yi",
    foundingOrg: "Binance & BNB Chain Community",
    originalPurpose:
      "Originally issued as an ERC-20 utility token to give Binance exchange traders discounts on trading fees and participate in Launchpad token sales.",
    consensus: "Proof of Staked Authority (PoSA) / Parlia",
    tps: "150 - 300 TPS (BNB Smart Chain)",
    avgFeeINR: "₹2 - ₹15",
    color: "#f3ba2f",
    gradient: "from-yellow-500 to-amber-600",
    currentRole:
      "Native gas token for the high-throughput BNB Smart Chain (BSC) DeFi ecosystem, Binance ecosystem utility, and decentralized governance.",
    milestones: [
      {
        year: "2017",
        title: "Initial Coin Offering (ICO)",
        description:
          "Raised $15 million in July 2017 during Binance's launch, with tokens priced at approximately $0.10.",
        category: "launch",
      },
      {
        year: "2019",
        title: "Binance Chain Mainnet Launch",
        description:
          "Migrated from Ethereum ERC-20 to its own proprietary sovereign blockchain, establishing the BEP-2 token format.",
        category: "upgrade",
      },
      {
        year: "2020",
        title: "BNB Smart Chain (BSC) Goes Live",
        description:
          "Launched EVM-compatible parallel chain with smart contract capability, igniting low-fee DeFi alternatives like PancakeSwap.",
        category: "upgrade",
      },
      {
        year: "2022",
        title: "Auto-Burn Mechanism Implemented",
        description:
          "Replaced manual quarterly burns with an objective on-chain Auto-Burn algorithm aimed at reducing total supply down to 100M BNB.",
        category: "upgrade",
      },
      {
        year: "2023 - 2024",
        title: "opBNB & Greenfield Storage",
        description:
          "Launched opBNB Optimism-based Layer 2 and BNB Greenfield decentralized data storage infrastructure.",
        category: "milestone",
      },
    ],
    majorDevelopments: [
      "Rigorous programmatic deflationary burning reducing supply from 200M to 100M BNB",
      "High-speed, low-fee smart contract ecosystem processing billions of transactions",
      "Ecosystem integration across Launchpool, Launchpad, and Web3 Wallet infrastructure",
    ],
  },
  solana: {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    launchDate: "March 2020",
    founder: "Anatoly Yakovenko, Greg Fitzgerald, Raj Gokal",
    foundingOrg: "Solana Labs & Solana Foundation",
    originalPurpose:
      "A high-speed, web-scale Layer 1 blockchain engineered for ultra-low latency, sub-second finality, and sub-cent fees without relying on sharding or Layer 2s.",
    consensus: "Proof of History (PoH) combined with Proof of Stake (Tower BFT)",
    tps: "2,000 - 4,500+ TPS (Theoretical 65,000)",
    avgFeeINR: "₹0.02 - ₹0.50",
    color: "#14f195",
    gradient: "from-teal-400 via-cyan-500 to-purple-600",
    currentRole:
      "Leading high-performance blockchain for decentralized finance, decentralized physical infrastructure networks (DePIN), memecoins, and high-frequency trading.",
    milestones: [
      {
        year: "2017",
        title: "Proof of History Whitepaper",
        description:
          "Former Qualcomm engineer Anatoly Yakovenko conceptualized Proof of History as a verifiable cryptographic clock for distributed systems.",
        category: "launch",
      },
      {
        year: "2020",
        title: "Mainnet Beta Launch",
        description:
          "Mainnet Beta launched in March 2020, featuring smart contracts written in Rust and C with blazing fast 400ms block times.",
        category: "launch",
      },
      {
        year: "2021",
        title: "Solana Summer & Explosive Surge",
        description:
          "SOL surged into top 5 cryptos powered by viral NFT marketplaces (Magic Eden) and explosive DeFi liquidity.",
        category: "milestone",
      },
      {
        year: "2022",
        title: "FTX Collapse & Stress Test",
        description:
          "Suffered heavy market pressure following the collapse of Alameda/FTX, but developers rallied around independent open-source network resilience.",
        category: "event",
      },
      {
        year: "2023 - 2024",
        title: "Resurgence & Firedancer Client",
        description:
          "Achieved historic volume dominance in retail DEX trading, DePIN projects (Helium, Render), and testing of Jump Crypto's ultra-fast Firedancer validator client.",
        category: "upgrade",
      },
    ],
    majorDevelopments: [
      "Proof of History (PoH) solves the distributed timing problem, eliminating validator communication overhead",
      "Sealevel parallel transaction execution engine utilizing multi-core hardware processing",
      "Firedancer independent validator client built in C/C++ boosting throughput toward 1,000,000 TPS",
      "Solana Mobile Saga & Chapter 2 hardware integrations with built-in Seed Vault",
    ],
  },
};
