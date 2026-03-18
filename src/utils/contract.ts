import { rpc, Contract, xdr, scValToNative, nativeToScVal, TransactionBuilder } from '@stellar/stellar-sdk';
import type { Transaction } from '@stellar/stellar-base';
import { NETWORK } from './stellar';
import { transactionTracker, waitForTransactionConfirmation } from './transaction';
import { AuctionErrorHandler } from './errors';

// Initialize Soroban RPC client (rpc.Server in SDK 14)
const server = new rpc.Server(NETWORK.rpcUrl);

export { server as sorobanServer };

// Auction contract client
export class AuctionContractClient {
  private contract: Contract;

  constructor(contractId: string) {
    this.contract = new Contract(contractId);
  }

  // Build and return initialize_auction transaction for the caller to sign and submit
  async initializeAuction(
    _sourceAccount: string,
    auctionItem: string,
    description: string,
    startingPrice: number,
    auctionDuration: number
  ) {
    const transactionId = `init_${Date.now()}`;
    transactionTracker.addTransaction(transactionId, 'Initialize Auction', {
      auctionItem,
      description,
      startingPrice,
      auctionDuration
    });

    try {
      const transaction = await server.prepareTransaction(
        this.contract.call(
          "initialize_auction",
          nativeToScVal(auctionItem, { type: 'symbol' }),
          nativeToScVal(description, { type: 'symbol' }),
          nativeToScVal(startingPrice, { type: 'i128' }),
          nativeToScVal(auctionDuration, { type: 'u64' })
        ) as unknown as Transaction
      );
      return { success: true as const, transaction, transactionId };
    } catch (error) {
      console.error('Error initializing auction:', error);
      transactionTracker.updateTransaction(transactionId, 'failed', error instanceof Error ? error.message : 'Unknown error');
      const auctionError = AuctionErrorHandler.handleContractError(error);
      return { success: false as const, error: auctionError, transactionId };
    }
  }

  // Build and return place_bid transaction for the caller to sign and submit
  async placeBid(_sourceAccount: string, bidder: string, amount: number) {
    const transactionId = `bid_${Date.now()}`;
    transactionTracker.addTransaction(transactionId, 'Place Bid', { bidder, amount });

    try {
      const transaction = await server.prepareTransaction(
        this.contract.call(
          "place_bid",
          nativeToScVal(bidder, { type: 'address' }),
          nativeToScVal(amount, { type: 'i128' })
        ) as unknown as Transaction
      );
      return { success: true as const, transaction, transactionId };
    } catch (error) {
      console.error('Error placing bid:', error);
      transactionTracker.updateTransaction(transactionId, 'failed', error instanceof Error ? error.message : 'Unknown error');
      const auctionError = AuctionErrorHandler.handleContractError(error);
      return { success: false as const, error: auctionError, transactionId };
    }
  }

  // Submit a signed transaction (envelope XDR from wallet) and return the hash
  async submitSignedTransaction(signedTxXdr: string): Promise<{ hash: string }> {
    const tx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK.passphrase) as Transaction;
    const result = await server.sendTransaction(tx);
    if (result.status === 'ERROR' && result.errorResult) {
      throw new Error(result.errorResult.toString?.() ?? 'Transaction rejected');
    }
    return { hash: result.hash };
  }

  // Get current auction state
  async getAuctionState() {
    try {
      const result = await server.simulateTransaction(
        this.contract.call("get_auction_state") as unknown as Transaction
      );

      const simResult = result as { error?: string; returnValue?: xdr.ScVal };
      if (simResult.error) {
        throw new Error(simResult.error);
      }

      const auctionState = scValToNative(simResult.returnValue!);
      return { success: true, data: auctionState };
    } catch (error) {
      console.error('Error getting auction state:', error);

      // Handle and return structured error
      const auctionError = AuctionErrorHandler.handleContractError(error);
      return { success: false, error: auctionError };
    }
  }

  // Finalize the auction
  async finalizeAuction(sourceAccount: string) {
    const transactionId = `finalize_${Date.now()}`;
    transactionTracker.addTransaction(transactionId, 'Finalize Auction');

    try {
      const transaction = await server.prepareTransaction(
        this.contract.call("finalize_auction") as unknown as Transaction
      );

      // In a real implementation, you would sign and submit the transaction
      // For now, we'll simulate success
      transactionTracker.updateTransaction(transactionId, 'success', 'SIMULATED_HASH');

      return { success: true, transaction, transactionId };
    } catch (error) {
      console.error('Error finalizing auction:', error);
      transactionTracker.updateTransaction(transactionId, 'failed', error instanceof Error ? error.message : 'Unknown error');

      // Handle and return structured error
      const auctionError = AuctionErrorHandler.handleContractError(error);
      return { success: false, error: auctionError, transactionId };
    }
  }
}

// Export singleton instance if contract ID is available
let contractClient: AuctionContractClient | null = null;

export function getContractClient(contractId?: string) {
  if (!contractClient && contractId) {
    contractClient = new AuctionContractClient(contractId);
  }
  return contractClient;
}