'use client';

import React from 'react';
import AuctionDisplay from '@/components/AuctionDisplay';
import PlaceBidForm from '@/components/PlaceBidForm';
import WalletConnection from '@/components/WalletConnection';
import { useWallet } from '@/context/WalletContext';

export default function AuctionsPage() {
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Active Auctions
      </h1>

      <WalletConnection
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        isConnected={isConnected}
        address={address}
      />

      {isConnected && address && (
        <>
          <div className="mt-6">
            <AuctionDisplay />
          </div>
          <div className="mt-6">
            <PlaceBidForm bidder={address} />
          </div>
        </>
      )}
    </div>
  );
}