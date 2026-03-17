'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuctionError, AuctionErrorHandler } from '@/utils/errors';

interface ErrorContextType {
  errors: AuctionError[];
  addError: (error: AuctionError) => void;
  removeError: (index: number) => void;
  clearErrors: () => void;
  handleError: (error: any, context: string) => AuctionError;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<AuctionError[]>([]);

  const addError = (error: AuctionError) => {
    setErrors(prev => [...prev, error]);
  };

  const removeError = (index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const handleError = (error: any, context: string): AuctionError => {
    let auctionError: AuctionError;

    // Determine error type and handle accordingly
    if (error.type && typeof error.type === 'string') {
      // Already an AuctionError
      auctionError = error;
    } else if (error.message && error.message.includes('wallet')) {
      // Wallet error
      auctionError = AuctionErrorHandler.handleWalletError(error);
    } else if (error.message && error.message.includes('Auction') || error.message && error.message.includes('Bid')) {
      // Contract error
      auctionError = AuctionErrorHandler.handleContractError(error);
    } else if (error.message && error.message.includes('network') || error.message && error.message.includes('Network')) {
      // Network error
      auctionError = AuctionErrorHandler.handleNetworkError(error);
    } else {
      // Unknown error
      auctionError = AuctionErrorHandler.handleContractError(error);
    }

    // Log the error
    AuctionErrorHandler.logError(auctionError, context);

    // Add to error list
    addError(auctionError);

    return auctionError;
  };

  const value = {
    errors,
    addError,
    removeError,
    clearErrors,
    handleError
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useErrorHandler() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useErrorHandler must be used within an ErrorProvider');
  }
  return context;
}