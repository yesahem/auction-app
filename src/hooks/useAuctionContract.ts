'use client';

import { useState, useEffect } from 'react';
import { getContractClient } from '@/utils/contract';
import { CONTRACT_IDS } from '@/utils/stellar';
import { useTransactionTracker } from '@/hooks/useTransactionTracker';
import { useErrorHandler } from '@/context/ErrorContext';

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
  const { handleError } = useErrorHandler();

  useEffect(() => {
    // Initialize contract client
    const client = getContractClient(CONTRACT_IDS.auction);
    if (client) {
      setContractClient(client);
    }
  }, []);

  const fetchAuctionState = async () => {
    if (!contractClient) {
      const auctionError = handleError(
        { type: 'contract_not_initialized', message: 'Contract client not initialized' },
        'fetchAuctionState'
      );
      setError(auctionError.message);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await contractClient.getAuctionState();
      if (result.success) {
        setAuctionState(result.data);
      } else {
        const auctionError = handleError(result.error, 'fetchAuctionState');
        setError(auctionError.message);
      }
    } catch (err) {
      const auctionError = handleError(err, 'fetchAuctionState');
      setError(auctionError.message);
    } finally {
      setLoading(false);
    }
  };

  const placeBid = async (bidder: string, amount: number) => {
    if (!contractClient) {
      const auctionError = handleError(
        { type: 'contract_not_initialized', message: 'Contract client not initialized' },
        'placeBid'
      );
      setError(auctionError.message);
      return { success: false, error: auctionError.message, transactionId: null };
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
        const auctionError = handleError(result.error, 'placeBid');
        setError(auctionError.message);
        return { success: false, error: auctionError.message, transactionId: result.transactionId };
      }
    } catch (err) {
      const auctionError = handleError(err, 'placeBid');
      setError(auctionError.message);
      return { success: false, error: auctionError.message, transactionId: null };
    } finally {
      setLoading(false);
    }
  };

  const initializeAuction = async (
    auctionItem: string,
    description: string,
    startingPrice: number,
    auctionDuration: number
  ): Promise<{ success: boolean; error?: string; transactionId?: string | null }> => {
    if (!contractClient) {
      const auctionError = handleError(
        { type: 'contract_not_initialized', message: 'Contract client not initialized' },
        'initializeAuction'
      );
      setError(auctionError.message);
      return { success: false, error: auctionError.message, transactionId: null };
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
        const auctionError = handleError(result.error, 'initializeAuction');
        setError(auctionError.message);
        return { success: false, error: auctionError.message, transactionId: result.transactionId };
      }
    } catch (err) {
      const auctionError = handleError(err, 'initializeAuction');
      setError(auctionError.message);
      return { success: false, error: auctionError.message, transactionId: null };
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