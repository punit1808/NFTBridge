import React, { useState, useEffect } from "react";
import './NavBar.css';
import img1 from './Images/nftlogo.png';
import ConnectWallet from './Connect';
import { Copy } from 'lucide-react'; // You can use this or any other icon

function NavigationBar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchWallet = async () => {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    localStorage.setItem('walletAddress', accounts[0]);
                }
            }
        };

        fetchWallet();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                setWalletAddress(accounts[0] || '');
            });
        }
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="navBound">
            <div className="nav1">
                <img className="image01" src={img1} alt="Logo" />
                <h1>NFT BRIDGE</h1>
            </div>

            <div className="network-bridge hide-on-mobile">
                <span className="network-name">Polygon</span>
                <span className="bridge-icon">↔</span>
                <span className="network-name">Ethereum</span>
            </div>

            <div className="navRight">
                {!isMobile && !walletAddress && <ConnectWallet />}
                {!isMobile && walletAddress && (
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
                {isMobile && (
                    <button className="menuToggle" onClick={() => setMenuOpen(!menuOpen)}>
                        ☰
                    </button>
                )}
            </div>

            {menuOpen && isMobile && (
                <div className="mobileMenu">
                    {!walletAddress ? (
                        <ConnectWallet />
                    ) : (
                        <div className="walletAddressMobile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
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
            )}
        </div>
    );
}

export default NavigationBar;
