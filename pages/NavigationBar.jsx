import React, { useState } from "react";
import './NavBar.css';
import img1 from './Images/StudySyn avatar.svg';
import ConnectWallet from './Connect';

function NavigationBar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="navBound">
            <div className="nav1">
                <img className="image01" src={img1} alt="Logo" />
                <h1>NFT BRIDGE</h1>
            </div>

            <div className={`nav2 ${menuOpen ? 'show' : ''}`}>
                <a href="#">Home</a>
                <a href="#">Store</a>
                <a href="#">About Us</a>
                <a href="#">Contact</a>
            </div>

            <div className="navRight">
                <ConnectWallet />
                <button className="menuToggle" onClick={() => setMenuOpen(!menuOpen)}>
                    ☰
                </button>
            </div>
        </div>
    );
}

export default NavigationBar;
