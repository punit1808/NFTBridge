// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTCollectionA is ERC721A, Ownable {
    uint256 public tokenCounter;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => string) private _prompts;

    constructor() ERC721A("NFTCollection", "NFTC"){
        tokenCounter = 0;
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    function promptDescription(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Prompt query for nonexistent token");
        return _prompts[tokenId];
    }

    function mintNFT(
        address recipient,
        string memory uri,
        string memory prompt
    ) public onlyOwner {
        uint256 newItemId = tokenCounter;
        _safeMint(recipient, 1); // Mint 1 NFT using ERC721A's efficient minting
        _setTokenURI(newItemId, uri);
        _prompts[newItemId] = prompt;
        tokenCounter += 1;
    }

    // Batch mint multiple NFTs with different URIs and prompts (optional but useful for efficiency)
    function batchMintNFTs(
        address recipient,
        string[] memory uris,
        string[] memory prompts
    ) public onlyOwner {
        require(uris.length == prompts.length, "Mismatched arrays");
        uint256 count = uris.length;
        uint256 startId = tokenCounter;

        _safeMint(recipient, count);

        for (uint256 i = 0; i < count; i++) {
            uint256 tokenId = startId + i;
            _setTokenURI(tokenId, uris[i]);
            _prompts[tokenId] = prompts[i];
        }

        tokenCounter += count;
    }
}
