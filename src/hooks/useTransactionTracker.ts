'use client';

import { useState, useEffect } from 'react';
import { transactionTracker, TransactionRecord, TransactionStatus } from '@/utils/transaction';

export function useTransactionTracker() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionRecord[]>([]);

  useEffect(() => {
    // Initialize with existing transactions
    setTransactions(transactionTracker.getAllTransactions());

    // Subscribe to transaction updates
    const handleTransactionUpdate = (transaction: TransactionRecord) => {
      setTransactions(prev => {
        // Update or add the transaction
        const existingIndex = prev.findIndex(t => t.id === transaction.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = transaction;
          return updated;
        } else {
          return [...prev, transaction];
        }
      });

      // Update recent transactions (last 5)
      setRecentTransactions(prev => {
        const updated = prev.filter(t => t.id !== transaction.id);
        updated.unshift({...transaction});
        return updated.slice(0, 5);
      });
    };

    transactionTracker.subscribe(handleTransactionUpdate);

    // Cleanup function
    return () => {
      transactionTracker.unsubscribe(handleTransactionUpdate);
    };
  }, []);

  // Add a new transaction to track
  const addTransaction = (type: string, data?: any) => {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return transactionTracker.addTransaction(id, type, data);
  };

  // Update transaction status
  const updateTransaction = (id: string, status: TransactionStatus, hashOrError?: string) => {
    return transactionTracker.updateTransaction(id, status, hashOrError);
  };

  // Get a specific transaction
  const getTransaction = (id: string) => {
    return transactionTracker.getTransaction(id);
  };

  // Get pending transactions
  const getPendingTransactions = () => {
    return transactions.filter(t => t.status === 'pending');
  };

  // Get failed transactions
  const getFailedTransactions = () => {
    return transactions.filter(t => t.status === 'failed');
  };

  return {
    transactions,
    recentTransactions,
    addTransaction,
    updateTransaction,
    getTransaction,
    getPendingTransactions,
    getFailedTransactions
  };
}