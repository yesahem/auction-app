#!/bin/bash

# Script to test the auction contract functions

# Check if soroban CLI is installed
if ! command -v soroban &> /dev/null
then
    echo "Soroban CLI could not be found. Please install it first."
    exit 1
fi

# Set network parameters
NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

# Contract ID (you'll need to replace this with your deployed contract ID)
CONTRACT_ID=""  # Replace with your deployed contract ID

# Test functions
echo "Testing contract functions..."

# Initialize auction
echo "Initializing auction..."
soroban contract invoke \
  --id $CONTRACT_ID \
  --source ACCOUNT_SECRET_KEY \
  --rpc-url $RPC_URL \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- \
  initialize_auction \
  --auction_item "TestItem" \
  --description "Test auction item" \
  --starting_price 100 \
  --auction_duration 3600

# Get auction state
echo "Getting auction state..."
soroban contract invoke \
  --id $CONTRACT_ID \
  --source ACCOUNT_SECRET_KEY \
  --rpc-url $RPC_URL \
  --network-passphrase "$NETWORK_PASSPHRASE" \
  -- \
  get_auction_state

echo "Testing complete!"