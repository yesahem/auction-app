'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  /** Sign a transaction XDR with the connected wallet (for Soroban). */
  signTransaction: (xdr: string, networkPassphrase: string) => Promise<string>;
  isKitReady: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

let kitInitialized = false;

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isKitReady, setIsKitReady] = useState(false);
  const kitRef = useRef<{
    authModal: () => Promise<{ address: string }>;
    getAddress: () => Promise<{ address: string }>;
    disconnect: () => Promise<void>;
    signTransaction: (xdr: string, opts: { networkPassphrase: string }) => Promise<{ signedTxXdr: string }>;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const { StellarWalletsKit } = require('@creit.tech/stellar-wallets-kit/sdk');
      const { defaultModules } = require('@creit.tech/stellar-wallets-kit/modules/utils');
      const { Networks } = require('@creit.tech/stellar-wallets-kit/types');

      if (!kitInitialized) {
        StellarWalletsKit.init({
          modules: defaultModules(),
          network: Networks.TESTNET,
        });
        kitInitialized = true;
      }

      kitRef.current = {
        authModal: () => StellarWalletsKit.authModal(),
        getAddress: () => StellarWalletsKit.getAddress(),
        disconnect: () => StellarWalletsKit.disconnect(),
        signTransaction: (xdr, opts) => StellarWalletsKit.signTransaction(xdr, opts),
      };
      setIsKitReady(true);
      StellarWalletsKit.getAddress()
        .then((res: { address: string }) => {
          setAddress(res.address);
          setIsConnected(true);
        })
        .catch(() => {
          // No wallet connected yet
        });
    } catch (e) {
      console.warn('Stellar Wallets Kit load failed:', e);
      setIsKitReady(true);
    }
  }, []);

  const connectWallet = async () => {
    const kit = kitRef.current;
    if (!kit) return;
    try {
      const { address: addr } = await kit.authModal();
      setAddress(addr);
      setIsConnected(true);
    } catch (e: unknown) {
      const err = e as { code?: number; message?: string };
      if (err?.code === -1 && err?.message?.includes('closed')) {
        return;
      }
      throw e;
    }
  };

  const disconnectWallet = async () => {
    const kit = kitRef.current;
    if (kit) await kit.disconnect();
    setAddress(null);
    setIsConnected(false);
  };

  const signTransaction = async (xdr: string, networkPassphrase: string): Promise<string> => {
    const kit = kitRef.current;
    if (!kit) throw new Error('Wallet kit not ready');
    const { signedTxXdr } = await kit.signTransaction(xdr, { networkPassphrase });
    return signedTxXdr;
  };

  const value: WalletContextType = {
    isConnected,
    address,
    connectWallet,
    disconnectWallet,
    signTransaction,
    isKitReady,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
