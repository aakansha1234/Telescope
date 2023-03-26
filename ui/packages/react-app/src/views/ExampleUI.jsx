/* global BigInt */
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import { utils } from "ethers";
import { SyncOutlined } from "@ant-design/icons";
import { default as vmtree } from "vmtree-sdk";
import { utils as ff } from "ffjavascript";
import { Address, AddressInput, Balance, Events } from "../components";
import { setServers } from "dns";

export default function ExampleUI({
  purpose,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const [newPurpose, setNewPurpose] = useState("loading...");
  const [S, setS] = useState();
  const [receiver, setReceiver] = useState();
  const [hash, setHash] = useState();

  function verifyMerkleProof({ pathElements, pathIndices, leaf, root }) {
    pathElements.forEach((element, i) => {
      leaf = !pathIndices[i] ? vmtree.poseidon([leaf, element]) : vmtree.poseidon([element, leaf]);
    });
    return leaf == root;
  }

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>Attest:</h2>
        <h4>to:</h4>
        <AddressInput
          onChange={e => {
            console.log(e);
            setReceiver(e);
          }}
        />
        <Divider />
        <div style={{ margin: 8 }}>
          <Input
            onChange={e => {
              console.log(e.target.value);
              setNewPurpose(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              console.log("newPurpose", newPurpose);
              const newHash = utils.id(newPurpose);
              console.log(newHash);
              setHash(newHash);

              const nullifier = 1;
              const commitment = vmtree.poseidon([BigInt(newHash), nullifier]);
              console.log("commitment", commitment);
              /* look how you call setPurpose on your contract: */
              /* notice how you pass a call back for tx updates too */
              const result = tx(writeContracts.ATTESTOR.attest(commitment), update => {
                console.log("📡 Transaction Update:", update);
                if (update && (update.status === "confirmed" || update.status === 1)) {
                  console.log(" 🍾 Transaction " + update.hash + " finished!");
                  console.log(
                    " ⛽️ " +
                      update.gasUsed +
                      "/" +
                      (update.gasLimit || update.gas) +
                      " @ " +
                      parseFloat(update.gasPrice) / 1000000000 +
                      " gwei",
                  );
                }
              });
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Attest
          </Button>
          <Divider />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              const rootContract = BigInt(await readContracts.ATTESTOR.getLatestRoot());
              const nullifier = 1;
              const nullifierHash = vmtree.poseidon([nullifier]);
              const attestor = 525279371322396282297056180228022127699628446806n;
              console.log(newPurpose);
              const newHash = utils.id(newPurpose);
              console.log("newHash", newHash);
              const secret = BigInt(newHash);

              const allowlist_tree = new vmtree.MerkleTree({
                hasher: vmtree.poseidon,
                baseString: "zero",
                // leaves: this.allowed_empty_leaves
              });
              // console.log('zero', allowlist_tree.zeros)
              // allow a few deposits
              console.log("secret", secret);
              console.log("nullifier", nullifier);
              console.log("nullifierHash", nullifierHash);
              const leaf = vmtree.poseidon([vmtree.poseidon([secret, nullifier]), attestor]);
              console.log("leaf", leaf);
              console.log("init root", allowlist_tree.root);
              allowlist_tree.update(0, leaf);
              // allowlist_tree.update(1, leaf);
              console.log("post root", allowlist_tree.root);
              // console.log('roots');
              // console.log(BigInt(rootContract));
              // console.log(allowlist_tree.root);

              const root = allowlist_tree.root;
              console.log("rootContract", rootContract);
              if (rootContract !== root) throw "root mismatch";
              const path = 0;
              const { pathIndices, pathElements } = allowlist_tree.path(path);
              const input = vmtree.utils.stringifyBigInts({
                root,
                nullifierHash,
                attestor,
                nullifier,
                secret,
                pathElements,
                pathIndices,
              });
              console.log(input);
              console.log(
                "verifyMerkleProof",
                verifyMerkleProof({
                  leaf,
                  root,
                  pathElements,
                  pathIndices,
                }),
              );
              const { proof, publicSignals } = await vmtree.generateProof({
                input: input,
                wasmFileName: "/merkleTree.wasm",
                zkeyFileName: "/merkleTree_final.zkey",
              });
              console.log("proof", proof, publicSignals);
              function p256(n) {
                let nstr = ff.unstringifyBigInts(n).toString(10);
                // while (nstr.length < 64) nstr = "0" + nstr;
                // nstr = `${nstr}`;
                return nstr;
              }
              let inputs = [];
              for (let i = 0; i < publicSignals.length; i++) {
                inputs.push(p256(publicSignals[i]));
              }
              let solproof = {
                pi_a: [p256(proof.pi_a[0]), p256(proof.pi_a[1])],
                pi_b: [
                  [p256(proof.pi_b[0][1]), p256(proof.pi_b[0][0])],
                  [p256(proof.pi_b[1][1]), p256(proof.pi_b[1][0])],
                ],
                pi_c: [p256(proof.pi_c[0]), p256(proof.pi_c[1])],
                inputs: inputs,
              };
              console.log("S", solproof);
              setS(solproof);
            }}
          >
            Generate ZK proof
          </Button>
          <Divider/>
          {JSON.stringify(S)}
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              console.log(S);
              let x = await readContracts.ATTESTOR.verify(
                S.pi_a,
                S.pi_b,
                S.pi_c,
                S.inputs[0],
                S.inputs[1],
                `0x5C025775Fb7E7d03915fD3b641bc0Fef099CD456`,
              );
              console.log("x", x);
            }}
          >
            Verify proof
          </Button>
        </div>
      </div>
    </div>
  );
}
