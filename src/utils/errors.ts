// Error types for the auction application
export type AuctionErrorType =
  | 'wallet_not_connected'
  | 'transaction_rejected'
  | 'insufficient_balance'
  | 'bid_too_low'
  | 'auction_ended'
  | 'contract_not_initialized'
  | 'network_error'
  | 'unknown_error';

// Error interface
export interface AuctionError {
  type: AuctionErrorType;
  message: string;
  code?: number;
  originalError?: any;
}

// Error handler class
export class AuctionErrorHandler {
  // Handle wallet connection errors
  static handleWalletError(error: any): AuctionError {
    if (error.code === 4001) {
      return {
        type: 'transaction_rejected',
        message: 'Transaction rejected by wallet',
        code: error.code,
        originalError: error
      };
    }

    return {
      type: 'wallet_not_connected',
      message: 'Please connect your wallet to continue',
      originalError: error
    };
  }

  // Handle contract errors
  static handleContractError(error: any): AuctionError {
    // Parse contract error messages
    const errorMessage = error.message || error.toString();

    if (errorMessage.includes('AuctionNotActive')) {
      return {
        type: 'auction_ended',
        message: 'This auction has already ended',
        originalError: error
      };
    }

    if (errorMessage.includes('BidTooLow')) {
      return {
        type: 'bid_too_low',
        message: 'Your bid must be higher than the current highest bid',
        originalError: error
      };
    }

    if (errorMessage.includes('AuctionExpired')) {
      return {
        type: 'auction_ended',
        message: 'This auction has expired',
        originalError: error
      };
    }

    if (errorMessage.includes('AuctionNotInitialized')) {
      return {
        type: 'contract_not_initialized',
        message: 'Auction not initialized. Please contact support.',
        originalError: error
      };
    }

    return {
      type: 'unknown_error',
      message: errorMessage || 'An unknown error occurred',
      originalError: error
    };
  }

  // Handle network errors
  static handleNetworkError(error: any): AuctionError {
    return {
      type: 'network_error',
      message: 'Network error. Please check your connection and try again.',
      originalError: error
    };
  }

  // Handle insufficient balance errors
  static handleInsufficientBalance(balance: number, required: number): AuctionError {
    return {
      type: 'insufficient_balance',
      message: `Insufficient balance. You need ${required} XLM but only have ${balance} XLM.`,
    };
  }

  // Get user-friendly error message
  static getUserFriendlyMessage(error: AuctionError): string {
    switch (error.type) {
      case 'wallet_not_connected':
        return 'Please connect your wallet to participate in auctions.';

      case 'transaction_rejected':
        return 'Transaction was rejected. Please try again and confirm the transaction in your wallet.';

      case 'insufficient_balance':
        return error.message; // Already user-friendly

      case 'bid_too_low':
        return 'Your bid is too low. Please place a higher bid.';

      case 'auction_ended':
        return 'This auction has ended. No more bids can be placed.';

      case 'contract_not_initialized':
        return 'The auction contract is not properly initialized. Please contact support.';

      case 'network_error':
        return 'Network connection error. Please check your internet connection and try again.';

      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }

  // Log error for debugging
  static logError(error: AuctionError, context: string) {
    console.error(`[${context}] ${error.type}:`, {
      message: error.message,
      code: error.code,
      originalError: error.originalError
    });
  }
}