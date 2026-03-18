'use client';

import React from 'react';
import AuctionDisplay from '@/components/AuctionDisplay';
import PlaceBidForm from '@/components/PlaceBidForm';
import WalletConnection from '@/components/WalletConnection';
import EventFeed from '@/components/EventFeed';
import TransactionHistory from '@/components/TransactionHistory';
import { useWallet } from '@/context/WalletContext';

export default function AuctionsPage() {
  const { isConnected, address, connectWallet, disconnectWallet, isKitReady } = useWallet();

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
        isKitReady={isKitReady}
      />

      {isConnected && address && (
        <>
          <div className="mt-6">
            <AuctionDisplay />
          </div>
          <div className="mt-6">
            <EventFeed />
          </div>
          <div className="mt-6">
            <PlaceBidForm bidder={address} />
          </div>
          <div className="mt-6">
            <TransactionHistory />
          </div>
        </>
      )}
    </div>
  );
}