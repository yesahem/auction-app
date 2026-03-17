import { Networks } from '@stellar/stellar-sdk';

// Network configuration
export const NETWORK = {
  type: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet',
  passphrase: Networks.TESTNET,
  rpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
  horizonUrl: process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org'
};

// Contract configuration
export const CONTRACT_IDS = {
  // Will be populated after contract deployment
  auction: process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ID || ''
};

// Wallet configuration
export const WALLET_CONFIG = {
  appName: 'Stellar Auction App',
  appDescription: 'Real-time auction application on Stellar Soroban'
};