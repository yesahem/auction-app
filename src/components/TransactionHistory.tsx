'use client';

import React from 'react';
import { useTransactionTracker } from '@/hooks/useTransactionTracker';
import TransactionStatusIndicator from '@/components/TransactionStatusIndicator';

export default function TransactionHistory() {
  const { transactions } = useTransactionTracker();

  // Sort transactions by timestamp (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

  if (sortedTransactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-center text-gray-600 dark:text-gray-300">No transaction history</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Transaction History
        </h2>

        <div className="space-y-3">
          {sortedTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {transaction.type}
                    </h3>
                    <div className="ml-2">
                      <TransactionStatusIndicator transactionId={transaction.id} />
                    </div>
                  </div>

                  {transaction.data && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {JSON.stringify(transaction.data).substring(0, 100)}
                      {JSON.stringify(transaction.data).length > 100 ? '...' : ''}
                    </p>
                  )}

                  {transaction.error && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Error: {transaction.error}
                    </p>
                  )}

                  {transaction.hash && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Hash: {transaction.hash.substring(0, 8)}...{transaction.hash.substring(transaction.hash.length - 8)}
                    </p>
                  )}
                </div>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(transaction.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}