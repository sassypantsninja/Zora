// Load environment variables from .env
require('dotenv').config();
const { ethers } = require("ethers");
const { Zora } = require('@zoralabs/nft-hooks');

// Initialize Ethereum provider and wallet
const provider = new ethers.providers.InfuraProvider(process.env.NETWORK, process.env.INFURA_API_KEY);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Initialize Zora SDK with wallet
const zora = new Zora(wallet);

// Metadata for the NFT
const nftMetadata = {
  name: "My Unique NFT",
  description: "This is a unique artwork on Zora",
  image: "https://ipfs.io/ipfs/your-ipfs-image-hash" // Replace with your actual IPFS URL
};

// Function to mint an NFT on Zora
async function mintNFT() {
  try {
    console.log("Minting NFT...");
    const tx = await zora.mint({
      creator: wallet.address,
      metadata: nftMetadata,
      royaltyPercent: 10, // 10% royalty on secondary sales
    });
    
    await tx.wait(); // Wait for confirmation
    console.log("NFT Minted! Transaction Hash:", tx.hash);

    // Return the token ID (you may need this to set a reserve price)
    const receipt = await provider.getTransactionReceipt(tx.hash);
    const tokenId = receipt.logs[0].topics[3]; // Assuming the first log contains the token ID
    console.log("Token ID:", tokenId);
    return tokenId;
  } catch (error) {
    console.error("Minting failed:", error);
  }
}

// Function to set a reserve price (for listing as an auction)
async function setReservePrice(tokenId, reservePrice) {
  try {
    console.log("Setting reserve price...");
    const tx = await zora.createAuction({
      tokenId: tokenId,
      reservePrice: ethers.utils.parseEther(reservePrice.toString()), // Reserve price in ETH
      duration: 86400, // Auction duration in seconds (e.g., 86400 for 1 day)
    });

    await tx.wait(); // Wait for confirmation
    console.log("Auction Created! Transaction Hash:", tx.hash);
  } catch (error) {
    console.error("Setting reserve price failed:", error);
  }
}

// Main function to mint the NFT and set reserve price
async function main() {
  const tokenId = await mintNFT();
  
  if (tokenId) {
    await setReservePrice(tokenId, 0.5); // Set reserve price in ETH, e.g., 0.5 ETH
  } else {
    console.error("Token ID not found. Auction creation skipped.");
  }
}

main();
