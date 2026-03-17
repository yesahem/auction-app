#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Address, Env, Symbol};

#[derive(Clone)]
#[contracttype]
pub struct AuctionState {
    pub auction_item: Symbol,
    pub description: Symbol,
    pub starting_price: i128,
    pub highest_bid: i128,
    pub highest_bidder: Address,
    pub auction_end_time: u64,
    pub auction_active: bool,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum AuctionError {
    AuctionNotActive = 1,
    AuctionExpired = 2,
    BidTooLow = 3,
    AuctionNotEnded = 4,
    AuctionAlreadyFinalized = 5,
    AuctionNotInitialized = 6,
}

#[contract]
pub struct AuctionContract;

#[contractimpl]
impl AuctionContract {
    /// Initialize the auction with basic parameters
    pub fn initialize_auction(
        env: Env,
        auction_item: Symbol,
        description: Symbol,
        starting_price: i128,
        auction_duration: u64,
    ) {
        let auction_state = AuctionState {
            auction_item,
            description,
            starting_price,
            highest_bid: starting_price,
            highest_bidder: env.current_contract_address(), // Placeholder until first bid
            auction_end_time: env.ledger().timestamp() + auction_duration,
            auction_active: true,
        };

        env.storage().instance().set(&Symbol::short("STATE"), &auction_state);
    }

    /// Place a bid on the auction
    pub fn place_bid(env: Env, bidder: Address, amount: i128) -> Result<(), AuctionError> {
        // Load current auction state
        let mut auction_state: AuctionState = env
            .storage()
            .instance()
            .get(&Symbol::short("STATE"))
            .ok_or(AuctionError::AuctionNotInitialized)?;

        // Validate auction is still active
        if !auction_state.auction_active {
            return Err(AuctionError::AuctionNotActive);
        }

        // Validate auction hasn't expired
        if env.ledger().timestamp() >= auction_state.auction_end_time {
            auction_state.auction_active = false;
            env.storage().instance().set(&Symbol::short("STATE"), &auction_state);
            return Err(AuctionError::AuctionExpired);
        }

        // Validate bid amount
        if amount <= auction_state.highest_bid {
            return Err(AuctionError::BidTooLow);
        }

        // Update auction state
        auction_state.highest_bid = amount;
        auction_state.highest_bidder = bidder.clone();

        // Save updated state
        env.storage().instance().set(&Symbol::short("STATE"), &auction_state);

        // Emit NewBid event
        env.events().publish(
            (Symbol::short("AUCTION"), Symbol::short("NEW_BID")),
            AuctionEvent::NewBid(bidder, amount),
        );

        Ok(())
    }

    /// Get the current auction state
    pub fn get_auction_state(env: Env) -> Result<AuctionState, AuctionError> {
        env.storage()
            .instance()
            .get(&Symbol::short("STATE"))
            .ok_or(AuctionError::AuctionNotInitialized)
    }

    /// Finalize the auction when time is up
    pub fn finalize_auction(env: Env) -> Result<(), AuctionError> {
        // Load current auction state
        let mut auction_state: AuctionState = env
            .storage()
            .instance()
            .get(&Symbol::short("STATE"))
            .ok_or(AuctionError::AuctionNotInitialized)?;

        // Validate auction hasn't already been finalized
        if !auction_state.auction_active {
            return Err(AuctionError::AuctionAlreadyFinalized);
        }

        // Validate auction has expired
        if env.ledger().timestamp() < auction_state.auction_end_time {
            return Err(AuctionError::AuctionNotEnded);
        }

        // Finalize auction
        auction_state.auction_active = false;

        // Save updated state
        env.storage().instance().set(&Symbol::short("STATE"), &auction_state);

        // Emit AuctionEnded event
        env.events().publish(
            (Symbol::short("AUCTION"), Symbol::short("ENDED")),
            AuctionEvent::AuctionEnded(
                auction_state.highest_bidder.clone(),
                auction_state.highest_bid,
            ),
        );

        Ok(())
    }
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum AuctionEvent {
    NewBid(Address, i128),
    AuctionEnded(Address, i128),
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{symbol_short, testutils::Address as _, vec, Env, Symbol};

    #[test]
    fn test_initialize_auction() {
        let env = Env::default();
        let contract_id = env.register_contract(None, AuctionContract);
        let client = AuctionContractClient::new(&env, &contract_id);

        // Initialize auction
        client.initialize_auction(&Symbol::short("TestItem"), &Symbol::short("Test Description"), &100i128, &3600u64);

        // Get auction state
        let auction_state = client.get_auction_state();

        assert_eq!(auction_state.auction_item, Symbol::short("TestItem"));
        assert_eq!(auction_state.description, Symbol::short("Test Description"));
        assert_eq!(auction_state.starting_price, 100);
        assert_eq!(auction_state.highest_bid, 100);
        assert_eq!(auction_state.auction_active, true);
    }

    #[test]
    fn test_place_bid() {
        let env = Env::default();
        let contract_id = env.register_contract(None, AuctionContract);
        let client = AuctionContractClient::new(&env, &contract_id);
        let bidder = env.accounts().generate();

        // Initialize auction
        client.initialize_auction(&Symbol::short("TestItem"), &Symbol::short("Test Description"), &100i128, &3600u64);

        // Place bid
        let result = client.try_place_bid(&bidder, &150i128);
        assert!(result.is_ok());
    }

    #[test]
    fn test_bid_too_low() {
        let env = Env::default();
        let contract_id = env.register_contract(None, AuctionContract);
        let client = AuctionContractClient::new(&env, &contract_id);
        let bidder = env.accounts().generate();

        // Initialize auction
        client.initialize_auction(&Symbol::short("TestItem"), &Symbol::short("Test Description"), &100i128, &3600u64);

        // Try to place a bid lower than starting price
        let result = client.try_place_bid(&bidder, &50i128);
        assert!(result.is_err());
        assert_eq!(result.err().unwrap().unwrap(), AuctionError::BidTooLow);
    }
}
