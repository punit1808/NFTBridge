import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import tokenContractJSON from "./abi/NFTCollection.json";
import "./OwnedNFTs.css";

const BATCH_SIZE = 10; // number of NFTs to fetch per batch

const OwnedNFTs = () => {
  const [contractAddress, setContractAddress] = useState("");
  const [status, setStatus] = useState("Enter a contract address to fetch NFTs.");
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastFetchedTokenId, setLastFetchedTokenId] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);

  // Connect wallet and get signer address
  const connectWallet = async () => {
    if (!window.ethereum) {
      setStatus("MetaMask is not installed.");
      return;
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      setStatus("Wallet connected: " + address);
    } catch (err) {
      console.error(err);
      setStatus("Failed to connect wallet.");
    }
  };

  // Fetch total tokens from contract
  const fetchTotalTokens = async (nftContract) => {
    try {
      // console.log("Before");
      const count = await nftContract.tokenCounter(); // public variable
      // console.log(count);
      return count.toNumber ? count.toNumber() : Number(count); // ethers BigNumber conversion
    } catch (err) {
      console.error("Failed to fetch total tokens:", err);
      return 0;
    }
  };

  // Fetch NFTs owned by the signer in batches
  const fetchOwnedNFTs = async () => {
    if (!ethers.isAddress(contractAddress)) {
      setStatus("Invalid contract address.");
      return;
    }
    if (!walletAddress) {
      setStatus("Please connect your wallet first.");
      return;
    }

    try {
      setLoading(true);
      setStatus("Fetching your NFTs...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(contractAddress, tokenContractJSON.abi, signer);

      let total = totalTokens;
      if (!total) {
        total = await fetchTotalTokens(nftContract);
        setTotalTokens(total);
      }

      const owned = [...ownedNFTs];
      const startId = lastFetchedTokenId;
      const endId = Math.min(startId + BATCH_SIZE, total);

      for (let tokenId = startId; tokenId < endId; tokenId++) {
        try {
          const owner = await nftContract.ownerOf(tokenId);
          if (owner.toLowerCase() === walletAddress.toLowerCase()) {
            const uri = await nftContract.tokenURI(tokenId);
            owned.push({ tokenId, uri });
          }
        } catch (err) {
          console.log(`Token ID ${tokenId} not found or burned`);
        }
      }

      setOwnedNFTs(owned);
      setLastFetchedTokenId(endId);

      if (endId < total) {
        setStatus(`Fetched ${owned.length} NFT(s). More available. Click 'Load More'.`);
      } else {
        setStatus(`Fetched all ${owned.length} NFT(s) owned by you.`);
      }
    } catch (err) {
      console.error(err);
      setStatus("Error fetching NFTs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ownedNFTsBox">
      <h1>Your NFTs</h1>

      <div className="inputRow">
        <input
          type="text"
          className="inputField"
          placeholder="Enter contract address"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />
        <button className="btn" onClick={() => { setOwnedNFTs([]); setLastFetchedTokenId(0); fetchOwnedNFTs(); }}>
          Fetch NFTs
        </button>
        <button className="btn connectBtn" onClick={connectWallet}>Connect Wallet</button>
      </div>

      <div className="status">{status}</div>

      <div className="nftGrid">
        {ownedNFTs.map(nft => (
          <div key={nft.tokenId} className="nftCard">
            <p><b>Token ID: {nft.tokenId}</b></p>
            <img src={nft.uri.replace("ipfs://", "https://ipfs.io/ipfs/")} alt={`NFT ${nft.tokenId}`} />
          </div>
        ))}
      </div>

      {lastFetchedTokenId < totalTokens && (
        <button className="btn loadMoreBtn" onClick={fetchOwnedNFTs} disabled={loading}>
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
};

export default OwnedNFTs;
