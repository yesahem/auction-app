'use client';

import { useState, useEffect } from 'react';
import { getContractClient } from '@/utils/contract';
import { CONTRACT_IDS } from '@/utils/stellar';
import { useTransactionTracker } from '@/hooks/useTransactionTracker';

interface AuctionState {
  auction_item: string;
  description: string;
  starting_price: number;
  highest_bid: number;
  highest_bidder: string;
  auction_end_time: number;
  auction_active: boolean;
}

export function useAuctionContract() {
  const [contractClient, setContractClient] = useState<ReturnType<typeof getContractClient> | null>(null);
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addTransaction, updateTransaction } = useTransactionTracker();

  useEffect(() => {
    // Initialize contract client
    const client = getContractClient(CONTRACT_IDS.auction);
    if (client) {
      setContractClient(client);
    }
  }, []);

  const fetchAuctionState = async () => {
    if (!contractClient) {
      setError('Contract client not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await contractClient.getAuctionState();
      if (result.success) {
        setAuctionState(result.data);
      } else {
        setError(result.error?.message || 'Failed to fetch auction state');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const placeBid = async (bidder: string, amount: number) => {
    if (!contractClient) {
      setError('Contract client not initialized');
      return { success: false, error: 'Contract client not initialized', transactionId: null };
    }

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, you would pass the source account from the wallet
      const result = await contractClient.placeBid('SOURCE_ACCOUNT', bidder, amount);

      if (result.success) {
        // Refresh auction state after successful bid
        await fetchAuctionState();
        return { success: true, transactionId: result.transactionId };
      } else {
        setError(result.error?.message || 'Failed to place bid');
        return { success: false, error: result.error?.message || 'Failed to place bid', transactionId: result.transactionId };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage, transactionId: null };
    } finally {
      setLoading(false);
    }
  };

  const initializeAuction = async (
    auctionItem: string,
    description: string,
    startingPrice: number,
    auctionDuration: number
  ) => {
    if (!contractClient) {
      setError('Contract client not initialized');
      return { success: false, error: 'Contract client not initialized', transactionId: null };
    }

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, you would pass the source account from the wallet
      const result = await contractClient.initializeAuction(
        'SOURCE_ACCOUNT',
        auctionItem,
        description,
        startingPrice,
        auctionDuration
      );

      if (result.success) {
        // Refresh auction state after successful initialization
        await fetchAuctionState();
        return { success: true, transactionId: result.transactionId };
      } else {
        setError(result.error?.message || 'Failed to initialize auction');
        return { success: false, error: result.error?.message || 'Failed to initialize auction', transactionId: result.transactionId };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage, transactionId: null };
    } finally {
      setLoading(false);
    }
  };

  return {
    auctionState,
    loading,
    error,
    fetchAuctionState,
    placeBid,
    initializeAuction
  };
}