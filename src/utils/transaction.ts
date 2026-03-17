import { TransactionBuilder, SorobanRpc } from '@stellar/stellar-sdk';
import { NETWORK } from './stellar';

// Transaction status types
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'cancelled';

// Transaction tracking interface
export interface TransactionRecord {
  id: string;
  status: TransactionStatus;
  type: string;
  timestamp: number;
  hash?: string;
  error?: string;
  data?: any;
}

// Transaction tracker class
export class TransactionTracker {
  private transactions: Map<string, TransactionRecord> = new Map();
  private listeners: Array<(transaction: TransactionRecord) => void> = [];

  // Add a new transaction to track
  addTransaction(id: string, type: string, data?: any): TransactionRecord {
    const transaction: TransactionRecord = {
      id,
      status: 'pending',
      type,
      timestamp: Date.now(),
      data
    };

    this.transactions.set(id, transaction);
    this.notifyListeners(transaction);

    return transaction;
  }

  // Update transaction status
  updateTransaction(id: string, status: TransactionStatus, hashOrError?: string): TransactionRecord | null {
    const transaction = this.transactions.get(id);
    if (!transaction) {
      console.warn(`Transaction ${id} not found`);
      return null;
    }

    transaction.status = status;

    if (status === 'success' && hashOrError) {
      transaction.hash = hashOrError;
    } else if (status === 'failed' && hashOrError) {
      transaction.error = hashOrError;
    }

    transaction.timestamp = Date.now();
    this.notifyListeners(transaction);

    return transaction;
  }

  // Get transaction by ID
  getTransaction(id: string): TransactionRecord | undefined {
    return this.transactions.get(id);
  }

  // Get all transactions
  getAllTransactions(): TransactionRecord[] {
    return Array.from(this.transactions.values());
  }

  // Subscribe to transaction updates
  subscribe(callback: (transaction: TransactionRecord) => void) {
    this.listeners.push(callback);
  }

  // Unsubscribe from transaction updates
  unsubscribe(callback: (transaction: TransactionRecord) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Notify all listeners of a transaction update
  private notifyListeners(transaction: TransactionRecord) {
    this.listeners.forEach(listener => {
      try {
        listener({...transaction}); // Pass a copy to prevent mutation
      } catch (error) {
        console.error('Error in transaction listener:', error);
      }
    });
  }

  // Remove old transactions (older than 1 hour)
  cleanupOldTransactions() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [id, transaction] of this.transactions.entries()) {
      if (transaction.timestamp < oneHourAgo) {
        this.transactions.delete(id);
      }
    }
  }
}

// Export singleton instance
export const transactionTracker = new TransactionTracker();

// Utility function to generate transaction IDs
export function generateTransactionId(): string {
  return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Utility function to wait for transaction confirmation
export async function waitForTransactionConfirmation(
  server: SorobanRpc.Server,
  transactionHash: string,
  timeoutMs: number = 30000
): Promise<{ status: 'success' | 'failed'; result?: any; error?: string }> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    try {
      const transactionResponse = await server.getTransaction(transactionHash);

      if (transactionResponse.status === 'SUCCESS') {
        return {
          status: 'success',
          result: transactionResponse
        };
      } else if (transactionResponse.status === 'FAILED') {
        return {
          status: 'failed',
          error: transactionResponse.resultXdr ?? 'Transaction failed'
        };
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.warn('Error polling for transaction:', error);
      // Continue polling
    }
  }

  return {
    status: 'failed',
    error: 'Transaction confirmation timeout'
  };
}