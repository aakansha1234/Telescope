// const chalk = require('chalk');
import { expect }  from 'chai';
import { default as vmtree } from 'vmtree-sdk';
import {utils as ff} from 'ffjavascript';
import VERIFIER_JSON from '../circuits/out/compiled_circuit/merkleTree_verifier.json'  assert { type: "json" };
const WASM_FNAME = "../circuits/out/compiled_circuit/merkleTree_js/merkleTree.wasm";
const ZKEY_FNAME = "../circuits/out/compiled_circuit/merkleTree_final.zkey";
const ZKP_TEST_TIMEOUT = 20000; // alter if necessary.

function verifyMerkleProof({pathElements, pathIndices, leaf, root}) {
    pathElements.forEach((element, i) => {
        leaf = !pathIndices[i] ?
            vmtree.poseidon([leaf, element]) : vmtree.poseidon([element, leaf]);
    });
    return leaf == root;
}

        const allowlist_tree = new vmtree.MerkleTree({
            hasher: vmtree.poseidon,
            baseString: "zero"
            // leaves: this.allowed_empty_leaves
        });
        // allow a few deposits
        const secret = 1;
        const nullifier = 2;
        const nullifierHash=vmtree.poseidon([nullifier]);
        const attestor = 728815563385977040452943777879061427756277306518n;
        const leaf = vmtree.poseidon([vmtree.poseidon([1,2]), attestor]);
        console.log(leaf);
        allowlist_tree.update(0, leaf);
        const root = allowlist_tree.root;
        console.log(root);
        const path = 0;
        const { pathIndices, pathElements } = allowlist_tree.path(path);
        expect(verifyMerkleProof({
            leaf,
            root,
            pathElements,
            pathIndices
        })).to.be.true;
    // });

//     it("should be able to generate valid zkps using the proof of inclusion in allowlist", async () => {
//         const assetMetadata = this.assetMetadata;
//         const paths = [0, 4, 7];
//         console.log(chalk.green("The following zkp proof generation times include instantiating the deposit merkle tree and the allowlist tree"));
//         for (const path of paths) { try {
//             console.time(`proof ${this.proofCounter}`);
//             const deposit_tree = new MerkleTree({ hasher: poseidon, baseString: "zero"});
//             let firstAttest =
//             await deposit_tree.update(0, )
// x
//             // allow a few deposits
//             await allowlist_tree.update(0, ALLOWED);
//             await allowlist_tree.update(4, ALLOWED);
//             await allowlist_tree.update(7, ALLOWED);
//             const { pathElements: mainProof, pathRoot: root } = await deposit_tree.path(path);
//             const { pathElements: subsetProof, pathRoot: subsetRoot } = await allowlist_tree.path(path);
//             const secret = this.secrets[path];
//             const nullifier = poseidon([secret, 1n, path]);
            const input = vmtree.utils.stringifyBigInts({
                root,
                nullifierHash,
                attestor,
                nullifier,
                secret,
                pathElements,
                pathIndices
            });
            // console.log('input', input);
            const { proof, publicSignals } = await vmtree.generateProof({
                input,
                wasmFileName: WASM_FNAME,
                zkeyFileName: ZKEY_FNAME
            });
            console.log('proof generated')
            // copy pasta p256 from snarkjs cli.cjs line 6726
            function p256(n) {
                let nstr = ff.unstringifyBigInts(n).toString(16);
                while (nstr.length < 64) nstr = "0" + nstr;
                nstr = `${nstr}`;
                return nstr;
            }
             let inputs = [];
            for (let i = 0; i < publicSignals.length; i++) {
                inputs.push(p256(publicSignals[i]));
            }
            let S = {
                pi_a: [p256(proof.pi_a[0]), p256(proof.pi_a[1])],
                pi_b: [
                [p256(proof.pi_b[0][1]), p256(proof.pi_b[0][0])],
                [p256(proof.pi_b[1][1]), p256(proof.pi_b[1][0])],
                ],
                pi_c: [p256(proof.pi_c[0]), p256(proof.pi_c[1])],
                inputs: inputs,
            };
            console.log(S);
            console.log(publicSignals);
//             console.timeEnd(`proof ${this.proofCounter++}`);
            expect(await vmtree.verifyProof({proof, publicSignals, verifierJson: VERIFIER_JSON})).to.be.true;
//         } catch (err) { console.error(err); }}
//     }).timeout(ZKP_TEST_TIMEOUT);

//     it("should be able to generate proofs of exclusion in a block subset", async () => {
//         this.blocklist_tree = new MerkleTree({
//             hasher: poseidon,
//             baseString: "allowed",
//             leaves: this.blocked_empty_leaves
//         });
//         // this time we're blocking all of the deposits except for 3
//         // this is the logically equivalent proof of the allowlist, except
//         // it's using a blocklist instead.
//         for (let i = 0; i < 42; i++) {
//             if (i == 0 || i == 4 || i == 7) {
//                 continue;
//             }
//             await this.blocklist_tree.update(i, BLOCKED);
//         }
//         const leaf = ALLOWED;
//         const root = this.blocklist_tree.root;
//         console.log('\tBlocklist root:', root);
//         const paths = [0, 4, 7];
//         for (const path of paths) { try {
//             const { pathIndices, pathElements } = await this.blocklist_tree.path(path);
//             expect(verifyMerkleProof({
//                 leaf,
//                 root,
//                 pathElements,
//                 pathIndices
//             })).to.be.true;
//         } catch (err) { console.error(err); }}
//     });

//     it("should be able to generate valid zkps using the proof of exclusion in blocklist", async () => {
//         const assetMetadata = this.assetMetadata;
//         const withdrawMetadata = this.withdrawMetadata;
//         const paths = [0, 4, 7];
//         console.log(chalk.blue("The following zkp proof generation times do not include instantiating the deposit merkle tree and the allowlist tree"));
//         for (const path of paths) { try {
//             console.time(`proof ${this.proofCounter}`);
//             const { pathElements: mainProof, pathRoot: root } = await this.deposit_tree.path(path);
//             const { pathElements: subsetProof, pathRoot: subsetRoot } = await this.blocklist_tree.path(path);
//             const secret = this.secrets[path];
//             const nullifier = poseidon([secret, 1n, path]);
//             const input = utils.stringifyBigInts({
//                 root,
//                 subsetRoot,
//                 nullifier,
//                 assetMetadata,
//                 withdrawMetadata,
//                 secret,
//                 path,
//                 mainProof,
//                 subsetProof
//             });
//             const { proof, publicSignals } = await generateProof({
//                 input,
//                 wasmFileName: WASM_FNAME,
//                 zkeyFileName: ZKEY_FNAME
//             });
//             console.timeEnd(`proof ${this.proofCounter++}`);
//             expect(await verifyProof({proof, publicSignals, verifierJson: VERIFIER_JSON})).to.be.true;
//         } catch (err) { console.error(err); }}
//     }).timeout(ZKP_TEST_TIMEOUT);

//     after(() => process.exit());
// });