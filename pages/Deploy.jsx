import React, { useState } from 'react';
import { ethers } from 'ethers';
import tokenContractJSON from './abi/NFTCollection.json';
import Mint from './Mint';
import Approve from './Approve';
import NavigationBar from './NavigationBar';
import OwnedNFTs from './OwnedNFTs';
import FeedbackSection from './FeedBack/FeedbackSection';
import './Deploy.css';

const networks = {
    ethereum: { name: 'Ethereum Mainnet', chainId: 1 },
    polygon: { name: 'Polygon Mainnet', chainId: 137 },
    sepolia: { name: 'sepolia Testnet', chainId: 11155111 },
    amoy: { name: 'Amoy Testnet', chainId: 80002 },
};

const Deploy = () => {
    const [selectedNetwork, setSelectedNetwork] = useState('sepolia');
    const [status, setStatus] = useState('waiting for action...');
    const [deployedAddress, setDeployedAddress] = useState('');
    const [contractName, setContractName] = useState('NFTCollection721A');
    const [contractSymbol, setContractSymbol] = useState('NFTA');

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
            setStatus(`Connected to ${network.name}. Requesting accounts...`);

            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            const tokenFactory = new ethers.ContractFactory(
                tokenContractJSON.abi,
                tokenContractJSON.bytecode,
                signer
            );

            setStatus('waiting for payment approval...');

            // Deploy the contract with dynamic name and symbol
            const contract = await tokenFactory.deploy(contractName, contractSymbol);
            setStatus('Deploying contract...');
            await contract.deploymentTransaction().wait();

            setDeployedAddress(contract.target);
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
            <NavigationBar />
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
                    {/* Contract Name & Symbol Inputs Side by Side */}
                    <div className='contractInputs' style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <input
                            type="text"
                            placeholder="Collection Name"
                            value={contractName}
                            onChange={(e) => setContractName(e.target.value)}
                            className="inputField"
                        />
                        <input
                            type="text"
                            placeholder="Symbol"
                            value={contractSymbol}
                            onChange={(e) => setContractSymbol(e.target.value)}
                            className="inputField"
                        />
                    </div>

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
            <OwnedNFTs/>
            <Approve deployedAddress={deployedAddress} selectedNetwork={selectedNetwork} />
            <FeedbackSection/>
        </div>
    );
};

export default Deploy;
