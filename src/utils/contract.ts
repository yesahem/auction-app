import { SorobanRpc, Contract, xdr, scValToNative, nativeToScVal } from '@stellar/stellar-sdk';
import { NETWORK } from './stellar';

// Initialize Soroban RPC client
const server = new SorobanRpc.Server(NETWORK.rpcUrl);

// Auction contract client
export class AuctionContractClient {
  private contract: Contract;

  constructor(contractId: string) {
    this.contract = new Contract(contractId);
  }

  // Initialize a new auction
  async initializeAuction(
    sourceAccount: string,
    auctionItem: string,
    description: string,
    startingPrice: number,
    auctionDuration: number
  ) {
    try {
      const transaction = await server.prepareTransaction(
        this.contract.call(
          "initialize_auction",
          nativeToScVal(auctionItem, { type: 'symbol' }),
          nativeToScVal(description, { type: 'symbol' }),
          nativeToScVal(startingPrice, { type: 'i128' }),
          nativeToScVal(auctionDuration, { type: 'u64' })
        )
      );

      // Sign and submit transaction
      // This would be implemented with the user's wallet
      return { success: true, transaction };
    } catch (error) {
      console.error('Error initializing auction:', error);
      return { success: false, error };
    }
  }

  // Place a bid on the auction
  async placeBid(sourceAccount: string, bidder: string, amount: number) {
    try {
      const transaction = await server.prepareTransaction(
        this.contract.call(
          "place_bid",
          nativeToScVal(bidder, { type: 'address' }),
          nativeToScVal(amount, { type: 'i128' })
        )
      );

      // Sign and submit transaction
      // This would be implemented with the user's wallet
      return { success: true, transaction };
    } catch (error) {
      console.error('Error placing bid:', error);
      return { success: false, error };
    }
  }

  // Get current auction state
  async getAuctionState() {
    try {
      const result = await server.simulateTransaction(
        this.contract.call("get_auction_state")
      );

      if (result.error) {
        throw new Error(result.error);
      }

      const auctionState = scValToNative(result.returnValue);
      return { success: true, data: auctionState };
    } catch (error) {
      console.error('Error getting auction state:', error);
      return { success: false, error };
    }
  }

  // Finalize the auction
  async finalizeAuction(sourceAccount: string) {
    try {
      const transaction = await server.prepareTransaction(
        this.contract.call("finalize_auction")
      );

      // Sign and submit transaction
      // This would be implemented with the user's wallet
      return { success: true, transaction };
    } catch (error) {
      console.error('Error finalizing auction:', error);
      return { success: false, error };
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