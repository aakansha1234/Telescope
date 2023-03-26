# zk-DID

Contracts, circuits, and scripts related to generating, attaching and proving attestations.

## Getting Started

To get started with this repo, you will need to have the following set up on your machine:

- [Foundry](https://github.com/foundry-rs/foundry) to compile contracts and run Solidity tests
- [Yarn](https://yarnpkg.com/) and [Node.js](https://nodejs.org/) for running Typescript util scripts
- [Circom](https://docs.circom.io/getting-started/installation/) to interact with our circuits

### Setup

#### Circuit setup

```sh
cd circuits && yarn install
```

This automatically downloads a [powers of tau file](https://github.com/iden3/snarkjs#7-prepare-phase-2) required for generating ZKPs. This download might take a while.

#### Script setup
```sh
cd scripts && yarn install
```

### Directory Structure

The project is structured as a mixed Solidity, Circom, and Typescript workspace.

```
├── circuits  // <-- Circom source code
├── contracts // <-- Solidity source code
├── scripts   // <-- Utils for proof generation
```

To run Solidity tests:

```sh
cd contracts
forge test
```

### Attestation contract deployments
- Scroll: https://blockscout.scroll.io/address/0x117620c5C1223d1378cE7FD0EEd067045A8F079B
- Optimism: https://optimistic.etherscan.io/address/0x056e1e4fef6066087b71c3669D9255C2D9AAcD0d
- Gnosis chiado: https://blockscout.com/gnosis/chiado/address/0x056e1e4fef6066087b71c3669D9255C2D9AAcD0d