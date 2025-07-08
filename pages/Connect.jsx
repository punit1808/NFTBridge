import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './Connect.css';
import { Copy } from 'lucide-react'; // You can use this or any other icon

const ConnectWallet = () => {
    const [defaultAccount, setDefaultAccount] = useState(null);
    const [connButtonText, setConnButtonText] = useState('Connect Wallet');


    useEffect(() => {
        if (defaultAccount) {
            localStorage.setItem('walletAddress', defaultAccount);
        } else {
            localStorage.removeItem('walletAddress');
        }
    }, [defaultAccount]);


    const connectWalletHandler = async () => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (window.ethereum && window.ethereum.isMetaMask) {
            console.log('MetaMask Here!');

            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setDefaultAccount(accounts[0]);
                setConnButtonText('Wallet Connected');
                localStorage.setItem('walletAddress', accounts[0]); 
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
            localStorage.setItem('walletAddress', defaultAccount);
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
            localStorage.setItem('walletAddress', defaultAccount);
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

    const handleCopy = () => {
        navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div>
            {!defaultAccount && (
                <button className='btnConnect' onClick={connectWalletHandler}>{connButtonText}</button>
            )}
            {defaultAccount && (
                <div className="walletAddressDesktop" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                    <button
                        onClick={handleCopy}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                        title="Copy Wallet Address"
                    >
                        <Copy size={16} />
                    </button>
                    {copied && <span style={{ fontSize: '12px', color: 'green' }}>Copied!</span>}
                </div>
            )}
        </div>
    );
};

export default ConnectWallet;
