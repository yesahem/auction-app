'use client';

import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useAuctionContract } from '@/hooks/useAuctionContract';
import WalletConnection from '@/components/WalletConnection';

export default function CreateAuctionPage() {
  const { isConnected, address, connectWallet, disconnectWallet, isKitReady } = useWallet();
  const { initializeAuction, loading, error } = useAuctionContract();
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [durationHours, setDurationHours] = useState('1');
  const [message, setMessage] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const name = itemName.trim().slice(0, 32);
    const desc = description.trim().slice(0, 32);
    const price = parseFloat(startingPrice);
    const hours = parseFloat(durationHours);

    if (!name) {
      setMessage('error');
      return;
    }
    if (isNaN(price) || price <= 0) {
      setMessage('error');
      return;
    }
    if (isNaN(hours) || hours <= 0 || hours > 8760) {
      setMessage('error');
      return;
    }

    const durationSeconds = Math.floor(hours * 3600);
    const result = await initializeAuction(name, desc || name, price, durationSeconds);

    if (result.success) {
      setMessage('success');
      setItemName('');
      setDescription('');
      setStartingPrice('');
      setDurationHours('1');
    } else {
      setMessage('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Create New Auction
      </h1>

      <WalletConnection
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        isConnected={isConnected}
        address={address}
        isKitReady={isKitReady}
      />

      {!isConnected ? (
        <p className="mt-6 text-gray-600 dark:text-gray-300">
          Connect your wallet to create an auction on the current contract.
        </p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mt-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Auction Details
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              This initializes the auction on the deployed contract (one auction per contract).
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  id="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g. RareArt"
                  maxLength={32}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Short description (stored as symbol)"
                  maxLength={32}
                />
              </div>

              <div>
                <label htmlFor="startingPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Starting Price (XLM)
                </label>
                <input
                  type="number"
                  id="startingPrice"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="durationHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  id="durationHours"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  min="0.25"
                  max="8760"
                  step="0.25"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
              {message === 'success' && (
                <p className="text-sm text-green-600 dark:text-green-400">Auction initialized successfully.</p>
              )}
              {message === 'error' && !error && (
                <p className="text-sm text-red-600 dark:text-red-400">Please check the form and try again.</p>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Creating...' : 'Create Auction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
