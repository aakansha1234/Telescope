// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "solmate/auth/Owned.sol";
import "./verifiers/merkleTree_verifier.sol";
import "./MerkleTree.sol";
import "forge-std/Test.sol";


contract Attestor is MerkleTree, Owned, Verifier {

    event Attest(
        uint indexed commitment,
        address indexed token,
        uint leafIndex,
        uint timestamp
    );

    error InvalidZKProof();
    error UnknownRoot();

    uint public constant ZERO = uint(keccak256(abi.encodePacked("zero"))) % snark_scalar_field;

    constructor(address poseidon, address _owner) MerkleTree(poseidon, ZERO) Owned(_owner) {}

    function attest(uint commitment)
        external
        returns (uint leafIndex, uint leaf)
    {
        uint attestor = uint(uint160(msg.sender));
        leaf = hasher.poseidon([commitment, attestor]);
        leafIndex = insert(leaf);
        emit Attest(commitment, msg.sender, leafIndex, block.timestamp);
    }

    function verify(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint root,
        uint nullifierHash,
        address attestor
    )
        external view
        returns (bool)
    {
        if (!isKnownRoot(root)) revert UnknownRoot();
        uint[3] memory input = [root, nullifierHash, uint(uint160(attestor))];
        if (!verifyProof(a,b,c, input)) revert InvalidZKProof();
        return true;
    }
}