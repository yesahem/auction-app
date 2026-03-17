# Stellar Auction Contract

This is a smart contract for a real-time auction system built on Stellar Soroban.

## Features

- Create auctions with item details and starting prices
- Place bids in real-time
- Automatic validation of bid amounts
- Event-driven architecture for real-time updates
- Proper error handling for common scenarios

## Contract Functions

### `initialize_auction`
Initializes a new auction with the specified parameters.

Parameters:
- `auction_item`: Symbol representing the item being auctioned
- `description`: Symbol describing the item
- `starting_price`: i128 starting price in stroops
- `auction_duration`: u64 duration in seconds

### `place_bid`
Places a bid on the active auction.

Parameters:
- `bidder`: Address of the bidder
- `amount`: i128 bid amount in stroops

Returns: Result<(), AuctionError>

### `get_auction_state`
Retrieves the current state of the auction.

Returns: AuctionState struct

### `finalize_auction`
Finalizes the auction when time has expired.

Returns: Result<(), AuctionError>

## Events

### `NewBid`
Emitted when a new bid is placed.

### `AuctionEnded`
Emitted when the auction is finalized.

## Error Types

- `AuctionNotActive`: Auction has ended
- `AuctionExpired`: Time has run out
- `BidTooLow`: Bid doesn't exceed current highest
- `AuctionNotEnded`: Trying to finalize before time is up
- `AuctionAlreadyFinalized`: Attempting to finalize twice
- `AuctionNotInitialized`: Contract not properly set up

## Development

### Prerequisites

- Rust toolchain
- wasm32-unknown-unknown target
- Soroban CLI (optional for deployment)

### Building

```bash
cargo build --release --target wasm32-unknown-unknown
```

### Testing

```bash
cargo test
```

### Deployment

Use the provided `deploy.sh` script to deploy to testnet.

## License

MIT