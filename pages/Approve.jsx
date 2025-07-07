import React, { useState } from 'react';
import { ethers } from 'ethers';
import fxRootContractABI from '../fxRootContractABI.json';
import tokenContractJSON from './abi/NFTCollection.json';
import './Approve.css';

const networks = {
    ethereum: {
        name: "Sepolia Testnet",
        chainId: 11155111,
        fxERC71RootAddress: "0x9E688939Cb5d484e401933D850207D6750852053", // Replace with Ethereum FxRoot address
    },
    polygon: {
        name: "Polygon Mainnet",
        chainId: 137,
        fxERC71RootAddress: "0xAnotherFxRootAddressForPolygon", // Replace with Polygon FxRoot address
    },
    rinkeby: {
        name: "Rinkeby Testnet",
        chainId: 4,
        fxERC71RootAddress: "0xAnotherFxRootAddressForRinkeby", // Replace with Rinkeby FxRoot address
    },
    amoy: {
        name: "Amoy Testnet",
        chainId: 80002,
        fxERC71RootAddress: "0x9E688939Cb5d484e401933D850207D6750852053", // Replace with Amoy FxRoot address
    },
};

const Approve = ({ deployedAddress, selectedNetwork }) => {
    const [status, setStatus] = useState('waiting for approval...');
    const [tokenId, setTokenId] = useState(0);
    const [currentNetwork, setCurrentNetwork] = useState(selectedNetwork);
    const [localDeployedAddress, setLocalDeployedAddress] = useState(deployedAddress);

    const approveAndDeposit = async () => {
        try {
            if (!window.ethereum) {
                setStatus('MetaMask is not installed.');
                return;
            }

            const network = networks[currentNetwork];
            setStatus(`Connecting to ${network.name}...`);

            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${network.chainId.toString(16)}` }],
            });

            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const tokenContract = new ethers.Contract(deployedAddress, tokenContractJSON.abi, signer);
            const fxContract = new ethers.Contract(network.fxERC71RootAddress, fxRootContractABI, signer);

            setStatus(`Approving token ID ${tokenId} for FxRoot on ${network.name}...`);
            const approveTx = await tokenContract.approve(network.fxERC71RootAddress, tokenId);
            await approveTx.wait();
            setStatus(`Approved token ID ${tokenId} for FxRoot on ${network.name}.`);

            setStatus(`Depositing token ID ${tokenId} to FxRootTunnel on ${network.name}...`);
            const depositTx = await fxContract.deposit(deployedAddress, await signer.getAddress(), tokenId, "0x6547");
            await depositTx.wait();
            setStatus(`Deposited token ID ${tokenId} to FxRootTunnel on ${network.name}.`);
        } catch (error) {
            console.error('Error:', error);
            setStatus('An error occurred during approval or deposit.');
        }
    };

    return (
        <div className="app">
            <h1>Approve and Deposit NFT</h1>
            <label>Select Network:</label>
            <select onChange={(e) => setCurrentNetwork(e.target.value)} value={currentNetwork}>
                {Object.entries(networks).map(([key, { name }]) => (
                    <option key={key} value={key}>
                        {name}
                    </option>
                ))}
            </select>
            <label>Enter Token ID:</label>
            <input 
                type="number" 
                value={tokenId} 
                onChange={(e) => setTokenId(e.target.value)} 
                min="0" 
                className="token-id-input"
            />
            <label>Enter Contract Address:</label>
            <input
                type="text"
                value={localDeployedAddress}
                onChange={(e) => setLocalDeployedAddress(e.target.value)}
                className="token-id-input"
                placeholder="0x...your deployed address"
            />
            <button onClick={approveAndDeposit} className="btn-approve-deposit">
                Approve and Deposit
            </button>
            <pre className="status">{status}</pre>
        </div>
    );
};

export default Approve;
