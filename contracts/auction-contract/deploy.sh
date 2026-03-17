#!/bin/bash

# Script to deploy the auction contract to Stellar Testnet

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

# Set account information (you'll need to replace these with your actual keys)
SOURCE_ACCOUNT=""  # Replace with your account secret key
CONTRACT_WASM="./target/wasm32-unknown-unknown/release/auction_contract.wasm"

# Check if contract WASM exists
if [ ! -f "$CONTRACT_WASM" ]; then
    echo "Contract WASM file not found. Building contract..."
    cargo build --release --target wasm32-unknown-unknown
fi

# Deploy contract
echo "Deploying contract..."
CONTRACT_ID=$(soroban contract deploy \
  --wasm $CONTRACT_WASM \
  --source $SOURCE_ACCOUNT \
  --rpc-url $RPC_URL \
  --network-passphrase "$NETWORK_PASSPHRASE")

echo "Contract deployed with ID: $CONTRACT_ID"

# Save contract ID to environment file
echo "NEXT_PUBLIC_AUCTION_CONTRACT_ID=$CONTRACT_ID" >> ../../.env.local

echo "Deployment complete!"