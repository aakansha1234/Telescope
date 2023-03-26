pragma circom 2.0.2;

include "./node_modules/circomlib/circuits/poseidon.circom";

template HashLeftRight() {
    signal input left;
    signal input right;
    signal output hash;

    component poseidon = Poseidon(2);
    poseidon.inputs[0] <== left;
    poseidon.inputs[1] <== right;
    hash <== poseidon.out;
}

template DualMux() {
    signal input in[2];
    signal input s;
    signal output out[2];

    out[0] <== (in[1] - in[0])*s + in[0];
    out[1] <== (in[0] - in[1])*s + in[1];
}

// Verifies that merkle proof is correct for given merkle root and a leaf
// pathIndices input is an array of 0/1 selectors telling whether given pathElement is on the left or right side of merkle path
template MerkleTreeChecker(levels) {
    signal input leaf;
    signal input root;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    component selectors[levels];
    component hashers[levels];

    for (var i = 0; i < levels; i++) {
        selectors[i] = DualMux();
        selectors[i].in[0] <== i == 0 ? leaf : hashers[i - 1].hash;
        selectors[i].in[1] <== pathElements[i];
        selectors[i].s <== pathIndices[i];

        hashers[i] = HashLeftRight();
        hashers[i].left <== selectors[i].out[0];
        hashers[i].right <== selectors[i].out[1];
    }

    root === hashers[levels - 1].hash;
}

template CommitmentHasher() {
    signal input nullifier;
    signal input secret;

    signal input attestor;

    signal output leaf;
    signal output nullifierHash;

    component commitment = Poseidon(2);
    commitment.inputs[0] <== secret;
    commitment.inputs[1] <== nullifier;

    component leafHasher = Poseidon(2);
    leafHasher.inputs[0] <== commitment.out;
    leafHasher.inputs[1] <== attestor;

    leaf <== leafHasher.out;

    component nullifierHasher = Poseidon(1);
    nullifierHasher.inputs[0] <== nullifier;
    nullifierHash <== nullifierHasher.out;
}

template MerkleTree(levels) {
    // public
    signal input root;
    signal output nullifierHash;
    signal input attestor;

    // private
    signal input nullifier;
    signal input secret;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    component hasher = CommitmentHasher();
    hasher.secret <== secret;
    hasher.nullifier <== nullifier;
    hasher.attestor <== attestor;
    hasher.nullifierHash === nullifierHash;

    component tree = MerkleTreeChecker(levels);
    tree.leaf <== hasher.leaf;
    tree.root <== root;
    for (var i = 0; i < levels; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i] <== pathIndices[i];
    }
}

component main {
    public [ root, nullifierHash, attestor ]
} = MerkleTree(20);