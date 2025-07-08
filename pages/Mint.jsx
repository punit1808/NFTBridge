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
    const [status, setStatus] = useState('waiting for minting...');
    const [walletAddress, setWalletAddress] = useState('');
    const [ipfsURI, setIpfsURI] = useState('');
    const [prompt, setPrompt] = useState('');
    const [localDeployedAddress, setLocalDeployedAddress] = useState(deployedAddress || '');

    // Sync with props or localStorage
    useEffect(() => {
        const storedAddress = localStorage.getItem('deployedAddress');
        if (storedAddress && storedAddress !== localDeployedAddress) {
            setLocalDeployedAddress(storedAddress);
        }
    }, []);

    useEffect(() => {
        if (deployedAddress && deployedAddress !== localDeployedAddress) {
            setLocalDeployedAddress(deployedAddress);
        }
    }, [deployedAddress]);

    const mintNFTs = async () => {
        try {
            const walletAdd = localStorage.getItem('walletAddress') || '';
            setWalletAddress(walletAdd);

            if (!window.ethereum) {
                setStatus('MetaMask is not installed.');
                return;
            }

            const network = networks[selectedNetwork];
            if (!network) {
                setStatus('Invalid network selected.');
                return;
            }

            setStatus(`Switching to ${selectedNetwork}...`);
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${network.chainId.toString(16)}` }],
            });

            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            if (!ethers.isAddress(localDeployedAddress)) {
                setStatus('Invalid contract address.');
                return;
            }

            const nftCollection = new ethers.Contract(localDeployedAddress, tokenContractJSON.abi, signer);

            const tx = await nftCollection.mintNFT(walletAddress, ipfsURI, prompt);
            await tx.wait();
            setStatus(`NFT Minted Successfully.`);
        } catch (error) {
            console.error('Minting Error:', error);
            setStatus('Error occurred while minting NFTs.');
        }
    };

    return (
        <div className="mintBox">
            <div className='insideMintBox'>
                <h1>Mint NFTs</h1>

                <div className='ifpsURL'>
                    <h4>Contract Address:</h4>
                    <input
                        className='inputField'
                        type="text"
                        value={localDeployedAddress}
                        onChange={(e) => setLocalDeployedAddress(e.target.value)}
                        placeholder="Enter deployed contract address"
                    />
                </div>

                <div className='ifpsURL'>
                    <h4>IPFS URI:</h4>
                    <input
                        className='inputField'
                        type="text"
                        value={ipfsURI}
                        onChange={(e) => setIpfsURI(e.target.value)}
                        placeholder="Enter IPFS URI"
                    />
                </div>

                <div className='ifpsURL'>
                    <h4>Prompt:</h4>
                    <input
                        className='inputField'
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter prompt (same as description)"
                    />
                </div>

                <br />
                <button onClick={mintNFTs} className="btn-deploy-mint">Mint NFT</button>
                <div className="status">{status}</div>
            </div>
        </div>
    );
};

export default Mint;
