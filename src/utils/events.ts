import { rpc, scValToNative, xdr } from '@stellar/stellar-sdk';
import { NETWORK } from './stellar';

const server = new rpc.Server(NETWORK.rpcUrl);

export interface ParsedAuctionEvent {
  type: 'NewBid' | 'AuctionEnded';
  bidder?: string;
  winner?: string;
  amount?: number;
  timestamp: number;
  txHash: string;
  ledger: number;
}

// Event listener for auction events using Soroban RPC getEvents
export class AuctionEventListener {
  private contractId: string;
  private listeners: Array<(event: ParsedAuctionEvent) => void> = [];
  private pollIntervalId: ReturnType<typeof setInterval> | null = null;
  private lastLedger = 0;
  private isClosed = false;

  constructor(contractId: string) {
    this.contractId = contractId;
  }

  subscribe(callback: (event: ParsedAuctionEvent) => void) {
    this.listeners.push(callback);
    if (this.listeners.length === 1) {
      this.startEventStream();
    }
  }

  unsubscribe(callback: (event: ParsedAuctionEvent) => void) {
    this.listeners = this.listeners.filter((l) => l !== callback);
    if (this.listeners.length === 0) {
      this.closeEventStream();
    }
  }

  private async startEventStream() {
    if (this.isClosed) return;
    try {
      const { sequence } = await server.getLatestLedger();
      this.lastLedger = sequence;
    } catch (e) {
      console.warn('AuctionEventListener: getLatestLedger failed', e);
    }

    const poll = async () => {
      if (this.isClosed || this.listeners.length === 0) return;
      try {
        const { sequence: latestLedger } = await server.getLatestLedger();
        const startLedger = this.lastLedger + 1;
        if (startLedger > latestLedger) {
          return;
        }
        const response = await server.getEvents({
          startLedger,
          endLedger: latestLedger,
          filters: [
            {
              type: 'contract',
              contractIds: [this.contractId],
            },
          ],
          limit: 50,
        });

        for (const ev of response.events) {
          const parsed = parseEventResponse(ev);
          if (parsed) {
            this.lastLedger = Math.max(this.lastLedger, ev.ledger);
            this.listeners.forEach((cb) => {
              try {
                cb(parsed);
              } catch (err) {
                console.error('AuctionEventListener callback error', err);
              }
            });
          }
        }
        this.lastLedger = latestLedger;
      } catch (e) {
        console.warn('AuctionEventListener: getEvents failed', e);
      }
    };

    await poll();
    this.pollIntervalId = setInterval(poll, 3000);
  }

  private closeEventStream() {
    this.isClosed = true;
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }

  // Kept for tests / demos
  simulateNewBid(bidder: string, amount: number) {
    this.listeners.forEach((cb) =>
      cb({
        type: 'NewBid',
        bidder,
        amount,
        timestamp: Date.now(),
        txHash: '',
        ledger: 0,
      })
    );
  }

  simulateAuctionEnded(winner: string, amount: number) {
    this.listeners.forEach((cb) =>
      cb({
        type: 'AuctionEnded',
        winner,
        amount,
        timestamp: Date.now(),
        txHash: '',
        ledger: 0,
      })
    );
  }
}

function parseEventResponse(ev: { topic?: xdr.ScVal[]; value?: xdr.ScVal; ledger: number; txHash: string; ledgerClosedAt: string }): ParsedAuctionEvent | null {
  try {
    const topic = ev.topic ?? [];
    const secondTopic = topic[1];
    const topicStr = secondTopic != null ? String(scValToNative(secondTopic)) : '';
    const isNewBid = topicStr === 'NEW_BID';
    const isEnded = topicStr === 'ENDED';
    if (!isNewBid && !isEnded) return null;

    let bidder: string | undefined;
    let amount: number | undefined;
    if (ev.value) {
      const native = scValToNative(ev.value);
      if (Array.isArray(native) && native.length >= 2) {
        bidder = typeof native[0] === 'string' ? native[0] : String(native[0]);
        const amt = native[1];
        amount = typeof amt === 'bigint' ? Number(amt) : typeof amt === 'number' ? amt : undefined;
      }
    }

    const ts = ev.ledgerClosedAt ? new Date(ev.ledgerClosedAt).getTime() : Date.now();
    if (isNewBid) {
      return { type: 'NewBid', bidder, amount, timestamp: ts, txHash: ev.txHash, ledger: ev.ledger };
    }
    return { type: 'AuctionEnded', winner: bidder, amount, timestamp: ts, txHash: ev.txHash, ledger: ev.ledger };
  } catch {
    return null;
  }
}

let eventListener: AuctionEventListener | null = null;

export function getEventListener(contractId?: string): AuctionEventListener | null {
  if (!eventListener && contractId) {
    eventListener = new AuctionEventListener(contractId);
  }
  return eventListener;
}

export function parseAuctionEvent(event: ParsedAuctionEvent): { type: string; data: Record<string, unknown> } {
  return {
    type: event.type,
    data: {
      bidder: event.bidder,
      winner: event.winner,
      amount: event.amount,
      timestamp: event.timestamp,
      txHash: event.txHash,
    },
  };
}
