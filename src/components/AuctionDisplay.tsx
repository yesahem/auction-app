'use client';

import React, { useEffect } from 'react';
import { useAuctionContract } from '@/hooks/useAuctionContract';

export default function AuctionDisplay() {
  const { auctionState, loading, error, fetchAuctionState } = useAuctionContract();

  useEffect(() => {
    fetchAuctionState();
  }, [fetchAuctionState]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-center text-gray-600 dark:text-gray-300">Loading auction data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-center text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!auctionState) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-center text-gray-600 dark:text-gray-300">No auction data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {auctionState.auction_item || 'Auction Item'}
        </h2>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {auctionState.description || 'No description available'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Starting Price</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {auctionState.starting_price ? `${auctionState.starting_price} XLM` : 'N/A'}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Highest Bid</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {auctionState.highest_bid ? `${auctionState.highest_bid} XLM` : 'No bids yet'}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Highest Bidder</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {auctionState.highest_bidder || 'No bids yet'}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {auctionState.auction_active ? 'Active' : 'Ended'}
            </p>
          </div>
        </div>

        {auctionState.auction_end_time && (
          <div className="mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Auction Ends</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {new Date(auctionState.auction_end_time * 1000).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}