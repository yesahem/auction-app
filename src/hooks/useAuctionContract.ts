'use client';

import { useState, useEffect } from 'react';
import { getContractClient, sorobanServer } from '@/utils/contract';
import { CONTRACT_IDS, NETWORK } from '@/utils/stellar';
import { useTransactionTracker } from '@/hooks/useTransactionTracker';
import { useErrorHandler } from '@/context/ErrorContext';
import { useWallet } from '@/context/WalletContext';
import { waitForTransactionConfirmation } from '@/utils/transaction';

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
  const { updateTransaction } = useTransactionTracker();
  const { handleError } = useErrorHandler();
  const { address: walletAddress, signTransaction } = useWallet();

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

    if (!walletAddress || !signTransaction) {
      const auctionError = handleError(
        { type: 'wallet_not_connected', message: 'Please connect your wallet to place a bid' },
        'placeBid'
      );
      setError(auctionError.message);
      return { success: false, error: auctionError.message, transactionId: null };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await contractClient.placeBid(walletAddress, bidder, amount);

      if (!result.success || !result.transaction) {
        if (!result.success && result.error) {
          const auctionError = handleError(result.error, 'placeBid');
          setError(auctionError.message);
        }
        return {
          success: false,
          error: !result.success && 'error' in result ? (typeof (result as { error: unknown }).error === 'object' && (result as { error: { message?: string } }).error?.message ? (result as { error: { message: string } }).error.message : String((result as { error: unknown }).error)) : undefined,
          transactionId: result.transactionId ?? null,
        };
      }

      const txXdr = result.transaction.toXDR();
      const signedXdr = await signTransaction(txXdr, NETWORK.passphrase);
      const { hash } = await contractClient.submitSignedTransaction(signedXdr);

      const confirm = await waitForTransactionConfirmation(sorobanServer, hash);
      updateTransaction(result.transactionId!, confirm.status === 'success' ? 'success' : 'failed', confirm.status === 'success' ? hash : confirm.error);

      if (confirm.status === 'success') {
        await fetchAuctionState();
        return { success: true, transactionId: result.transactionId };
      }
      const errMsg = confirm.error ?? 'Transaction failed';
      handleError({ message: errMsg }, 'placeBid');
      setError(errMsg);
      return { success: false, error: errMsg, transactionId: result.transactionId };
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

    if (!walletAddress || !signTransaction) {
      const auctionError = handleError(
        { type: 'wallet_not_connected', message: 'Please connect your wallet to create an auction' },
        'initializeAuction'
      );
      setError(auctionError.message);
      return { success: false, error: auctionError.message, transactionId: null };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await contractClient.initializeAuction(
        walletAddress,
        auctionItem,
        description,
        startingPrice,
        auctionDuration
      );

      if (!result.success || !result.transaction) {
        if (!result.success && result.error) {
          const auctionError = handleError(result.error, 'initializeAuction');
          setError(auctionError.message);
        }
        return {
          success: false,
          error: !result.success && 'error' in result ? (typeof (result as { error: unknown }).error === 'object' && (result as { error: { message?: string } }).error?.message ? (result as { error: { message: string } }).error.message : String((result as { error: unknown }).error)) : undefined,
          transactionId: result.transactionId ?? null,
        };
      }

      const txXdr = result.transaction.toXDR();
      const signedXdr = await signTransaction(txXdr, NETWORK.passphrase);
      const { hash } = await contractClient.submitSignedTransaction(signedXdr);

      const confirm = await waitForTransactionConfirmation(sorobanServer, hash);
      updateTransaction(result.transactionId!, confirm.status === 'success' ? 'success' : 'failed', confirm.status === 'success' ? hash : confirm.error);

      if (confirm.status === 'success') {
        await fetchAuctionState();
        return { success: true, transactionId: result.transactionId };
      }
      const errMsg = confirm.error ?? 'Transaction failed';
      handleError({ message: errMsg }, 'initializeAuction');
      setError(errMsg);
      return { success: false, error: errMsg, transactionId: result.transactionId };
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