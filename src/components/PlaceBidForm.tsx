'use client';

import React, { useState } from 'react';
import { useAuctionContract } from '@/hooks/useAuctionContract';

interface PlaceBidFormProps {
  bidder: string;
}

export default function PlaceBidForm({ bidder }: PlaceBidFormProps) {
  const { auctionState, placeBid, loading } = useAuctionContract();
  const [bidAmount, setBidAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bidAmount) {
      setMessage('Please enter a bid amount');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Please enter a valid bid amount');
      return;
    }

    if (auctionState && amount <= auctionState.highest_bid) {
      setMessage('Bid must be higher than current highest bid');
      return;
    }

    const result = await placeBid(bidder, amount);

    if (result.success) {
      setMessage('Bid placed successfully!');
      setBidAmount('');
    } else {
      setMessage(`Error placing bid: ${result.error}`);
    }
  };

  if (!auctionState || !auctionState.auction_active) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Place a Bid
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bid Amount (XLM)
          </label>
          <input
            type="number"
            id="bidAmount"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Placing Bid...' : 'Place Bid'}
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-md ${message.includes('Error') || message.includes('higher') ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}