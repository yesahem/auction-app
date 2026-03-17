'use client';

import React, { useState } from 'react';

interface WalletConnectionProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  address: string | null;
}

export default function WalletConnection({
  onConnect,
  onDisconnect,
  isConnected,
  address
}: WalletConnectionProps) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);

    try {
      // In a real implementation, this would connect to the actual wallet
      // For now, we'll simulate a connection with a placeholder address
      setTimeout(() => {
        const placeholderAddress = "GABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
        onConnect(placeholderAddress);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Wallet Connection
      </h2>

      {!isConnected ? (
        <button
          onClick={handleConnect}
          disabled={loading}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Connected Wallet</p>
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {address}
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Connected
            </span>
          </div>

          <button
            onClick={handleDisconnect}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
}