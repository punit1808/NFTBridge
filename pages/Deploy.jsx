import React, { useState } from 'react';
import { ethers } from 'ethers';
import tokenContractJSON from './abi/NFTCollection.json';
import Mint from './Mint';
import Approve from './Approve';
import NavigationBar from './NavigationBar';
import './Deploy.css';

const networks = {
    ethereum: { name: 'Ethereum Mainnet', chainId: 1 },
    polygon: { name: 'Polygon Mainnet', chainId: 137 },
    sepolia: { name: 'sepolia Testnet', chainId: 11155111 },
    amoy: { name: 'Amoy Testnet', chainId: 80002 },
};

const Deploy = () => {
    const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
    const [status, setStatus] = useState('Waiting for Contarct Deployment...');
    const [deployedAddress, setDeployedAddress] = useState('');

    const deployContract = async () => {
        try {
            if (!window.ethereum) {
                setStatus('MetaMask is not installed.');
                return;
            }

            const network = networks[selectedNetwork];
            setStatus(`Connecting to ${network.name}...`);

            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${network.chainId.toString(16)}` }],
            });

            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            setStatus('Deploying contract...');
            const tokenFactory = new ethers.ContractFactory(
                tokenContractJSON.abi,
                tokenContractJSON.bytecode,
                signer
            );

            // Deploy the contract and wait for it to be mined
            const contract = await tokenFactory.deploy();
            await contract.deploymentTransaction().wait(); // Using deploymentTransaction().wait() to wait for mining

            setDeployedAddress(contract.target); // Using `contract.target` for the deployed address
            setStatus('Contract Deployed');
        } catch (error) {
            console.error('Deployment Error:', error);

            if (error.code === 4001) {
                setStatus('Transaction rejected by user.');
            } else {
                setStatus('Error occurred during deployment.');
            }
        }
    };

    return (
        <div>
            <NavigationBar/>
            <div className="deploymain">
                <div className='dep01'>
                    <h1>Deploy NFT Contract</h1>
                    <div className='depin01'>
                        <h4>Select Network:</h4>
                        <select className='inputField' onChange={(e) => setSelectedNetwork(e.target.value)} value={selectedNetwork}>
                            {Object.entries(networks).map(([key, { name }]) => (
                                <option className="optionField" key={key} value={key}>
                                    {name}
                                </option>
                            ))}
                        </select>
                        <h4>Chain ID:</h4>
                        <input
                            className="inputField"
                            type="number"
                            value={networks[selectedNetwork]?.chainId || ''}
                            readOnly
                        />
                    </div>
                </div>
                <div className='dep02'>
                    <button onClick={deployContract} className="btn-deploy">
                        Deploy Contract
                    </button>
                    <div className='stsconnect'>
                        <div className="status">{status}</div>
                        {deployedAddress && <div className="status">Deployed Address: {deployedAddress}</div>}
                    </div>
                </div>
            </div>
            <Mint deployedAddress={deployedAddress} selectedNetwork={selectedNetwork} />
            <Approve deployedAddress={deployedAddress} selectedNetwork={selectedNetwork} />
        </div>
    );
};

export default Deploy;
