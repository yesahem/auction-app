'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const connectWallet = (walletAddress: string) => {
    setIsConnected(true);
    setAddress(walletAddress);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
  };

  const value = {
    isConnected,
    address,
    connectWallet,
    disconnectWallet
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