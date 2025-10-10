import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import tokenContractJSON from './abi/NFTCollection.json';
import './Mint.css';

const networks = {
  ethereum: { name: 'Ethereum Mainnet', chainId: 1 },
  polygon: { name: 'Polygon Mainnet', chainId: 137 },
  sepolia: { name: 'sepolia Testnet', chainId: 11155111 },
  amoy: { name: 'Amoy Testnet', chainId: 80002 },
};

const Mint = ({ deployedAddress, selectedNetwork }) => {
  const [status, setStatus] = useState('waiting for action...');
  const [walletAddress, setWalletAddress] = useState('');
  const [singleNFT, setSingleNFT] = useState({ ipfsURI: '', prompt: '' });
  const [batchNFTs, setBatchNFTs] = useState([{ uri: '', prompt: '' }]);
  const [isBatch, setIsBatch] = useState(false);
  const [localDeployedAddress, setLocalDeployedAddress] = useState(deployedAddress || '');
  const [currentNetwork, setCurrentNetwork] = useState('sepolia');

  useEffect(() => {
    const walletAdd = localStorage.getItem('walletAddress') || '';
    setWalletAddress(walletAdd);
    if (deployedAddress && deployedAddress !== localDeployedAddress) {
      setLocalDeployedAddress(deployedAddress);
    }
  }, [deployedAddress]);

  const handleSingleChange = (field, value) => {
    setSingleNFT(prev => ({ ...prev, [field]: value }));
  };

  const handleBatchChange = (index, field, value) => {
    const newBatch = [...batchNFTs];
    newBatch[index][field] = value;
    setBatchNFTs(newBatch);
  };

  const addBatchRow = () => {
    setBatchNFTs([...batchNFTs, { uri: '', prompt: '' }]);
  };

  const removeBatchRow = (index) => {
    const newBatch = [...batchNFTs];
    newBatch.splice(index, 1);
    setBatchNFTs(newBatch);
  };

  const mintNFTs = async () => {
    try {
      if (!window.ethereum) {
        setStatus('MetaMask is not installed.');
        return;
      }

      const network = networks[currentNetwork];
      if (!network) {
        setStatus('Invalid network selected.');
        return;
      }

      setStatus(`Switching to ${network.name}...`);
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${network.chainId.toString(16)}` }],
      });
      setStatus(`Connected to ${network.name}. Requesting accounts...`);

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      setStatus('Waiting for payment approval...');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (!ethers.isAddress(localDeployedAddress)) {
        setStatus('Invalid contract address.');
        return;
      }

      const nftCollection = new ethers.Contract(localDeployedAddress, tokenContractJSON.abi, signer);

      if (isBatch) {
        const uris = batchNFTs.map(item => item.uri);
        const prompts = batchNFTs.map(item => item.prompt);

        if (uris.some(uri => !uri) || prompts.some(prompt => !prompt)) {
          setStatus('All IPFS URIs and Prompts are required.');
          return;
        }

        const tx = await nftCollection.batchMintNFTs(walletAddress, uris, prompts);
        setStatus('Minting NFTs in batch...');
        await tx.wait();
        setStatus(`Batch NFTs Minted Successfully.`);
      } else {
        const { ipfsURI, prompt } = singleNFT;
        if (!ipfsURI || !prompt) {
          setStatus('IPFS URI and Prompt are required.');
          return;
        }

        const tx = await nftCollection.mintNFT(walletAddress, ipfsURI, prompt);
        setStatus('Minting NFT...');
        await tx.wait();
        setStatus(`NFT Minted Successfully.`);
      }
    } catch (error) {
      console.error('Minting Error:', error);
      setStatus('Error occurred while minting NFTs.');
    }
  };

  return (
    <div className="mintBox">
      <div className="insideMintBox">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Mint NFTs</h1>
          <button className="btn-batch" onClick={() => setIsBatch(!isBatch)}>
            {isBatch ? 'Single Mint' : 'Batch Mint'}
          </button>
        </div>

        <div className="ifpsURL">
          <h4>Select Network:</h4>
          <select
            className="inputField"
            value={currentNetwork}
            onChange={(e) => setCurrentNetwork(e.target.value)}
          >
            {Object.entries(networks).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>

        <div className="ifpsURL">
          <h4>Contract Address:</h4>
          <input
            className="inputField"
            type="text"
            value={localDeployedAddress}
            onChange={(e) => setLocalDeployedAddress(e.target.value)}
            placeholder="Enter deployed contract address"
          />
        </div>

        {!isBatch && (
          <>
            <div className="ifpsURL">
              <h4>IPFS URI:</h4>
              <input
                className="inputField"
                type="text"
                value={singleNFT.ipfsURI}
                onChange={(e) => handleSingleChange('ipfsURI', e.target.value)}
                placeholder="Enter IPFS URI"
              />
            </div>

            <div className="ifpsURL">
              <h4>Prompt:</h4>
              <input
                className="inputField"
                type="text"
                value={singleNFT.prompt}
                onChange={(e) => handleSingleChange('prompt', e.target.value)}
                placeholder="Enter prompt (same as description)"
              />
            </div>
          </>
        )}

        {isBatch && (
          <>
            {batchNFTs.map((item, index) => (
              <div className="batchRow" key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                <input
                  className="inputField"
                  type="text"
                  value={item.uri}
                  placeholder="Enter IPFS URI"
                  onChange={(e) => handleBatchChange(index, 'uri', e.target.value)}
                />
                <input
                  className="inputField"
                  type="text"
                  value={item.prompt}
                  placeholder="Enter Prompt"
                  onChange={(e) => handleBatchChange(index, 'prompt', e.target.value)}
                />
                <button className="btn-remove-row" onClick={() => removeBatchRow(index)}>✕</button>
              </div>
            ))}
            <button className="btn-add-row" onClick={addBatchRow}>
              + Add NFT
            </button>
            <br/>
          </>
        )}

        <br />
        <button onClick={mintNFTs} className="btn-deploy-mint">
          {isBatch ? 'Mint Batch NFTs' : 'Mint NFT'}
        </button>
        <div className="status">{status}</div>
      </div>
    </div>
  );
};

export default Mint;
