'use client';

import React from 'react';

export default function AuctionsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Active Auctions
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading auctions...
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Connect your wallet to view active auctions.
          </p>
        </div>
      </div>
    </div>
  );
}