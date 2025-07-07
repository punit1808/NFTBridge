// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const fxRootContractABI = require("../fxRootContractABI.json");
const tokenContractJSON = require("../artifacts/contracts/NFTCollection.sol/NFTCollection.json");

const tokenAddress = "0xBE373F4cfEa02279C199431F9fA7aDD7aE04d202"; // place your erc721A contract address here
const tokenABI = tokenContractJSON.abi;
const fxERC71RootAddress = "0x9E688939Cb5d484e401933D850207D6750852053";
const walletAddress = "0xa22999C408285a3C5FbCb53e29c1365c213d68d7"; // place your public address for your wallet here

async function main() {

    const tokenContract = await hre.ethers.getContractAt(tokenABI, tokenAddress);
    const fxContract = await hre.ethers.getContractAt(fxRootContractABI, fxERC71RootAddress);

    // for(let tokenId=0;tokenId<5;tokenId++){
      const tx = await tokenContract.approve(fxERC71RootAddress, 0);
      await tx.wait();
      console.log(`Approved token ID ${0} for FxRoot`);

      const deptx = await fxContract.deposit(tokenAddress, walletAddress, 0, "0x6547");
      await deptx.wait();
      console.log(`Deposited token ID ${0} to FxRootTunnel`);
    // }
  
  }
  
  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });