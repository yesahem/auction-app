'use client';

import React, { useEffect, useState } from 'react';
import { useAuctionContract } from '@/hooks/useAuctionContract';

function useCountdown(endTimeSeconds: number | null, active: boolean) {
  const [remaining, setRemaining] = useState<string>('--');

  useEffect(() => {
    if (endTimeSeconds == null || !active) {
      setRemaining('--');
      return;
    }
    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = endTimeSeconds - now;
      if (diff <= 0) {
        setRemaining('Ended');
        return;
      }
      const d = Math.floor(diff / 86400);
      const h = Math.floor((diff % 86400) / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      if (d > 0) setRemaining(`${d}d ${h}h ${m}m ${s}s`);
      else if (h > 0) setRemaining(`${h}h ${m}m ${s}s`);
      else if (m > 0) setRemaining(`${m}m ${s}s`);
      else setRemaining(`${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTimeSeconds, active]);

  return remaining;
}

export default function AuctionDisplay() {
  const { auctionState, loading, error, fetchAuctionState } = useAuctionContract();
  const countdown = useCountdown(auctionState?.auction_end_time ?? null, auctionState?.auction_active ?? false);

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

        {auctionState.auction_end_time != null && (
          <div className="mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Auction Ends</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {new Date(auctionState.auction_end_time * 1000).toLocaleString()}
            </p>
            <p className="text-md font-medium text-amber-600 dark:text-amber-400 mt-1">
              {countdown === 'Ended' ? 'Auction has ended' : `Time left: ${countdown}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}