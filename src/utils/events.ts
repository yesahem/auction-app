import { rpc } from '@stellar/stellar-sdk';
import { NETWORK } from './stellar';

// Initialize Soroban RPC client (rpc.Server in SDK 14)
const server = new rpc.Server(NETWORK.rpcUrl);

// Event listener for auction events
export class AuctionEventListener {
  private contractId: string;
  private eventSource: EventSource | null = null;
  private listeners: Array<(event: any) => void> = [];

  constructor(contractId: string) {
    this.contractId = contractId;
  }

  // Subscribe to auction events
  subscribe(callback: (event: any) => void) {
    this.listeners.push(callback);

    // If this is the first listener, start the event stream
    if (this.listeners.length === 1) {
      this.startEventStream();
    }
  }

  // Unsubscribe from auction events
  unsubscribe(callback: (event: any) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);

    // If no more listeners, close the event stream
    if (this.listeners.length === 0) {
      this.closeEventStream();
    }
  }

  // Start event stream
  private startEventStream() {
    // In a real implementation, we would use the Soroban RPC event streaming API
    // For now, we'll simulate event listening with periodic polling

    // This is a placeholder - in reality, you would connect to the actual event stream
    console.log(`Starting event stream for contract: ${this.contractId}`);

    // Simulate event listening (in practice, you'd use server.events() or similar)
    const interval = setInterval(() => {
      // This would be replaced with actual event fetching
      console.log('Polling for events...');
    }, 5000);

    // Store interval ID so we can clear it later
    (window as any).eventInterval = interval;
  }

  // Close event stream
  private closeEventStream() {
    console.log('Closing event stream');

    // Clear the polling interval
    if ((window as any).eventInterval) {
      clearInterval((window as any).eventInterval);
      delete (window as any).eventInterval;
    }
  }

  // Process incoming events
  private processEvent(event: any) {
    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  // Simulate receiving a new bid event
  simulateNewBid(bidder: string, amount: number) {
    const event = {
      type: 'NewBid',
      bidder,
      amount,
      timestamp: Date.now()
    };

    this.processEvent(event);
  }

  // Simulate receiving an auction ended event
  simulateAuctionEnded(winner: string, amount: number) {
    const event = {
      type: 'AuctionEnded',
      winner,
      amount,
      timestamp: Date.now()
    };

    this.processEvent(event);
  }
}

// Export singleton instance
let eventListener: AuctionEventListener | null = null;

export function getEventListener(contractId?: string) {
  if (!eventListener && contractId) {
    eventListener = new AuctionEventListener(contractId);
  }
  return eventListener;
}

// Utility function to parse contract events
export function parseAuctionEvent(event: any): { type: string; data: any } | null {
  try {
    // This would parse actual Soroban contract events
    // For now, we'll just return the event as-is
    return {
      type: event.type || 'Unknown',
      data: event
    };
  } catch (error) {
    console.error('Error parsing auction event:', error);
    return null;
  }
}