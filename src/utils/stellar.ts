import { Networks } from '@stellar/stellar-sdk';

// Network configuration
export const NETWORK = {
  type: 'testnet' as const,
  passphrase: Networks.TESTNET,
  rpcUrl: 'https://soroban-testnet.stellar.org',
  horizonUrl: 'https://horizon-testnet.stellar.org'
};

// Contract configuration
export const CONTRACT_IDS = {
  // Will be populated after contract deployment
  auction: ''
};

// Wallet configuration
export const WALLET_CONFIG = {
  appName: 'Stellar Auction App',
  appDescription: 'Real-time auction application on Stellar Soroban'
};