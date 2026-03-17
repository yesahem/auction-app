'use client';

import { useState, useEffect } from 'react';
import { getEventListener } from '@/utils/events';
import { useAuctionContract } from './useAuctionContract';

interface AuctionEvent {
  type: string;
  data: any;
  timestamp: number;
}

export function useAuctionEvents() {
  const { fetchAuctionState } = useAuctionContract();
  const [events, setEvents] = useState<AuctionEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real implementation, we would get the contract ID from environment variables
    const contractId = process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ID || '';

    if (!contractId) {
      setError('Contract ID not found');
      return;
    }

    const eventListener = getEventListener(contractId);

    if (!eventListener) {
      setError('Failed to initialize event listener');
      return;
    }

    // Handler for new events
    const handleEvent = (event: any) => {
      console.log('Received event:', event);

      // Add event to our events list
      setEvents(prevEvents => [
        ...prevEvents,
        {
          type: event.type,
          data: event,
          timestamp: event.timestamp || Date.now()
        }
      ]);

      // Refresh auction state when we receive events
      fetchAuctionState();
    };

    // Subscribe to events
    eventListener.subscribe(handleEvent);

    // Cleanup function
    return () => {
      eventListener.unsubscribe(handleEvent);
    };
  }, [fetchAuctionState]);

  // Function to simulate receiving events (for testing)
  const simulateNewBid = (bidder: string, amount: number) => {
    const contractId = process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ID || '';
    const eventListener = getEventListener(contractId);

    if (eventListener) {
      eventListener.simulateNewBid(bidder, amount);
    }
  };

  const simulateAuctionEnded = (winner: string, amount: number) => {
    const contractId = process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ID || '';
    const eventListener = getEventListener(contractId);

    if (eventListener) {
      eventListener.simulateAuctionEnded(winner, amount);
    }
  };

  return {
    events,
    loading,
    error,
    simulateNewBid,
    simulateAuctionEnded
  };
}