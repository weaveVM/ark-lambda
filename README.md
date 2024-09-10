<p align="center">
  <a href="https://wvm.dev">
    <img src="https://raw.githubusercontent.com/weaveVM/.github/main/profile/bg.png">
  </a>
</p>

## About
Ark Lambda is an implementation of the Ark protocol (multichain identity attestation protocol) on top of WeaveVM's MEM Lambda.

This protocol uses EVM address (EOA) as master address and control of its Ark (container of addresses). An EOA can link more than one Arweave address to its Ark.

## Deployment

run [./contract-scripts/deploy.js](./contract-scripts/deploy.js) to deploy a contract instance.

#### ark-lambda contract address: 

[0xcf12cd22ee7f2cebf632ae1f867faebcb270fbb98de8e3b7321560cd487922ca](https://lambda.pink/state/0xcf12cd22ee7f2cebf632ae1f867faebcb270fbb98de8e3b7321560cd487922ca)

## Interaction

check [./contract-scripts/interaction.js](./contract-scripts/interaction.js) to send a contract interaction.

N.B: with MEM Lambda there is no need to authenticate the EVM caller as it's injected in the MEM Lambda context under `lambda.msg.sender` -- Ark Lambda bidirectional addresses linkage validity is checked by the message body of the Arweave signature which consists of `msg_state_prefix::arweave_owner::evm_eoa` ([check in smart contract](./contract/ark.js#59))

## License
This projects is licensed user the [MIT License](./LICENSE)
