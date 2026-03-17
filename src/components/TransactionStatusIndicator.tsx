'use client';

import React from 'react';
import { useTransactionTracker } from '@/hooks/useTransactionTracker';

interface TransactionStatusIndicatorProps {
  transactionId: string;
}

export default function TransactionStatusIndicator({ transactionId }: TransactionStatusIndicatorProps) {
  const { getTransaction } = useTransactionTracker();
  const transaction = getTransaction(transactionId);

  if (!transaction) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        Unknown
      </span>
    );
  }

  switch (transaction.status) {
    case 'pending':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-yellow-800 dark:text-yellow-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Pending
        </span>
      );

    case 'success':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-800 dark:text-green-100" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3" />
          </svg>
          Success
        </span>
      );

    case 'failed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
          <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-red-800 dark:text-red-100" fill="currentColor" viewBox="0 0 8 8">
            <path d="M1.5 1.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Failed
        </span>
      );

    case 'cancelled':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          Cancelled
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          Unknown
        </span>
      );
  }
}