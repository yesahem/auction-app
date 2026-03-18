'use client';

import React, { useState } from 'react';

interface WalletConnectionProps {
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  isConnected: boolean;
  address: string | null;
  isKitReady?: boolean;
}

export default function WalletConnection({
  onConnect,
  onDisconnect,
  isConnected,
  address,
  isKitReady = true,
}: WalletConnectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConnect();
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    try {
      await onDisconnect();
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Wallet Connection
      </h2>

      {!isKitReady && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
          Loading wallet support...
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
      )}

      {!isConnected ? (
        <button
          onClick={handleConnect}
          disabled={loading || !isKitReady}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ${loading || !isKitReady ? 'opacity-50 cursor-not-allowed' : ''}`}
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
