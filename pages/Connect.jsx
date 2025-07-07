import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './Connect.css';

const ConnectWallet = () => {
    const [defaultAccount, setDefaultAccount] = useState(null);
    const [connButtonText, setConnButtonText] = useState('Connect Wallet');

    const connectWalletHandler = async () => {
        if (window.ethereum && window.ethereum.isMetaMask) {
            console.log('MetaMask Here!');

            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setDefaultAccount(accounts[0]);
                setConnButtonText('Wallet Connected');
            } catch (error) {
                console.error('Error connecting wallet:', error);
            }
        } else {
            console.log('Need to install MetaMask');
        }
    };

    const accountChangedHandler = (accounts) => {
        if (accounts.length > 0) {
            setDefaultAccount(accounts[0]);
            setConnButtonText('Wallet Connected');
        } else {
            setDefaultAccount(null);
            setConnButtonText('Connect Wallet');
        }
    };

    const chainChangedHandler = async () => {
        // Re-fetch the account after chain change to ensure it stays displayed
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            setDefaultAccount(accounts[0]);
            setConnButtonText('Wallet Connected');
        } else {
            setDefaultAccount(null);
            setConnButtonText('Connect Wallet');
        }
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', accountChangedHandler);
            window.ethereum.on('chainChanged', chainChangedHandler);

            // Cleanup listeners on component unmount
            return () => {
                window.ethereum.removeListener('accountsChanged', accountChangedHandler);
                window.ethereum.removeListener('chainChanged', chainChangedHandler);
            };
        }
    }, []);

    return (
        <div>
            {!defaultAccount && (
                <button className='btnConnect' onClick={connectWalletHandler}>{connButtonText}</button>
            )}
            {defaultAccount && (
                <div>
                    <h3>Address: {defaultAccount}</h3>
                </div>
            )}
        </div>
    );
};

export default ConnectWallet;
