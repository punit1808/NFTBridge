import React, { useState, useEffect } from "react";
import './NavBar.css';
import img1 from './Images/nftlogo.png';
import ConnectWallet from './Connect';

function NavigationBar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Detect screen resize for mobile responsiveness
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Detect wallet connection
    useEffect(() => {
        const fetchWallet = async () => {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
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

    return (
        <div className="navBound">
            <div className="nav1">
                <img className="image01" src={img1} alt="Logo" />
                <h1>NFT BRIDGE</h1>
            </div>

            <div className="network-bridge hide-on-mobile">
                <span className="network-name">Polygon</span>
                <span className="bridge-icon">🔗</span>
                <span className="network-name">Ethereum</span>
            </div>

            <div className="navRight">
                {!isMobile && !walletAddress && <ConnectWallet />}
                {!isMobile && walletAddress && (
                    <div className="walletAddressDesktop">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
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
                        <div className="walletAddressMobile">
                            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NavigationBar;
