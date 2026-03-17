'use client';

import React from 'react';
import { useAuctionEvents } from '@/hooks/useAuctionEvents';

export default function EventFeed() {
  const { events, error } = useAuctionEvents();

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-center text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>

        {events.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300 text-center py-4">
            No recent activity
          </p>
        ) : (
          <div className="space-y-3">
            {events.slice().reverse().map((event, index) => (
              <div
                key={index}
                className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-r"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.type === 'NewBid' ? 'New Bid Placed' :
                       event.type === 'AuctionEnded' ? 'Auction Ended' :
                       event.type}
                    </p>
                    {event.type === 'NewBid' && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Bidder: {event.data.bidder?.substring(0, 6)}...{event.data.bidder?.substring(event.data.bidder.length - 4)}
                        <br />
                        Amount: {event.data.amount} XLM
                      </p>
                    )}
                    {event.type === 'AuctionEnded' && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Winner: {event.data.winner?.substring(0, 6)}...{event.data.winner?.substring(event.data.winner.length - 4)}
                        <br />
                        Winning Bid: {event.data.amount} XLM
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}