import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './Connect.css';

const ConnectWallet = () => {
    const [defaultAccount, setDefaultAccount] = useState(null);
    const [connButtonText, setConnButtonText] = useState('Connect Wallet');

    const connectWalletHandler = async () => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (window.ethereum && window.ethereum.isMetaMask) {
            console.log('MetaMask Here!');

            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setDefaultAccount(accounts[0]);
                setConnButtonText('Wallet Connected');
            } catch (error) {
                console.error('Error connecting wallet:', error);
            }
        } else if (isMobile) {
            // Redirect mobile users to MetaMask app with deep link
            const dappUrl = encodeURIComponent(window.location.hostname);
            window.location.href = `https://metamask.app.link/dapp/${dappUrl}`;
        } else {
            console.log('MetaMask not detected. Please install MetaMask.');
            alert('MetaMask not detected. Please install MetaMask extension.');
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
