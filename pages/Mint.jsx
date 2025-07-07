import React, { useState } from 'react';
import { ethers } from 'ethers';
import tokenContractJSON from '../artifacts/contracts/NFTCollection.sol/NFTCollection.json';
import './Mint.css';

const networks = {
    ethereum: { name: 'Ethereum Mainnet', chainId: 1 },
    polygon: { name: 'Polygon Mainnet', chainId: 137 },
    sepolia: { name: 'sepolia Testnet', chainId: 11155111 },
    amoy: { name: 'Amoy Testnet', chainId: 80002 },
};

const Mint = ({ deployedAddress, selectedNetwork }) => {
    const [status, setStatus] = useState('');
    const [walletAddress, setWalletAddress] = useState('0xa22999c408285a3c5fbcb53e29c1365c213d68d7'); 
    const [ipfsURI, setIpfsURI] = useState('');
    const [prompt, setPrompt] = useState('');

    const mintNFTs = async () => {
        try {
            if (!window.ethereum) {
                setStatus('MetaMask is not installed.');
                return;
            }

            // Debugging output
            console.log('Selected Network:', selectedNetwork);
            console.log('Available Networks:', networks);

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
            const nftCollection = new ethers.Contract(deployedAddress, tokenContractJSON.abi, signer);

            // Mint the NFT with the provided IPFS URI and prompt
            const tx = await nftCollection.mintNFT(walletAddress, ipfsURI, prompt);
            await tx.wait();
            setStatus(`Minted NFT with URI: ${ipfsURI}`);
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
                    <h4>IPFS URI:</h4>
                    <input className='inputField'
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
                <button onClick={mintNFTs} className="btn-deploy-mint">Mint NFT</button>
                <pre className="status">{status}</pre>
            </div>
        </div>
    );
};

export default Mint;
