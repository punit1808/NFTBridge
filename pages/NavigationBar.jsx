import React from "react";
import './NavBar.css';
import img1 from './Images/StudySyn avatar.svg'
import ConnectWallet from './Connect';

function NavigationBar(){
    return(
        <div className="navBound">
            <div className="nav1">
                <img  className="image01" src={img1}/>
                <h1>NFT BRIDGE</h1>
            </div>
            <div className="nav2">
                <a href="#" >Home</a>
                <a href="#" >Store</a>
                <a href="#" >About Us</a>
                <a href="#" >Contact</a>
            </div>
            <ConnectWallet/>

        </div>
    )
}

export default NavigationBar;