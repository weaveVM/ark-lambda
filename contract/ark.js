export async function handle(state, action) {
  const input = action.input;

  if (input.function === "linkArweaveAddress") {
    // EOA address
    const caller = lambda.msg.sender.toLowerCase();
    const call_txid = lambda.tx.id;
    // function call inputs
    const { arweave_owner, arweave_sig } = input;
    // sig verification fn takes the EOA address to use it in the
    // sig msg creation
    await _verifyArSignature(arweave_owner, arweave_sig, caller);
    // convert JWK to address format
    const arweave_address = await _ownerToAddress(arweave_owner);
    // EOA is the master address, it can add multiple Arweave addresses
    // to an Ark (container of Arweave addresses linked to a unique EOA)
    if (!(caller in state.arks)) {
      state.arks[caller] = [];
    }

    state.arks[caller].push({arweave_address, call_txid});
    return { state };
  }

  if (input.function === "removeArweaveWallet") {
    const caller = lambda.msg.sender.toLowerCase();
    const { arweave_owner, arweave_sig } = input;

    ContractAssert(caller in state.arks, "ERROR_CALLER_NOT_FOUND");

    await _verifyArSignature(arweave_owner, arweave_sig, caller);
    // convert JWK to address format
    const arweave_address = await _ownerToAddress(arweave_owner);
    const arweave_address_index_in_ark = state.arks[caller].findIndex(
      (addr) => addr.arweave_address == arweave_address,
    );
    ContractAssert(
      arweave_address_index_in_ark >= 0,
      "ERROR_ARWEAVE_ADDRESS_NOT_FOUND",
    );

    state.arks[caller].splice(arweave_address_index_in_ark, 1);

    return { state };
  }

  async function _verifyArSignature(owner, signature, evm_caller) {
    try {
      const decryptedOwner = atob(owner);
      _validatePubKeySyntax(owner);

      const sigBody = state.sig_messages;
      // the AR sig msg takes the message from state(state.sig_messages), decryptedOwner and EOA,
      // all separated by "::" each
      const encodedMessage = btoa(
        `${sigBody[sigBody.length - 1]}::${decryptedOwner}::${evm_caller}::${state.counter}`,
      );

      const isValid = (
        await EXM.deterministicFetch(
          `${state.molecule_endpoints.ar_mem}/${owner}/${encodedMessage}/${signature}`,
        )
      ).asJSON().result;

      ContractAssert(isValid, "ERROR_INVALID_CALLER_SIGNATURE");
      ContractAssert(
        !state.signatures.includes(signature),
        "ERROR_SIGNATURE_ALREADY_USED",
      );
      state.signatures.push(signature);
      state.counter += 1;
    } catch (error) {
      throw new ContractError("ERROR_INVALID_CALLER_SIGNATURE");
    }
  }

  async function _ownerToAddress(pubkey) {
    const decryptedPubKey = atob(pubkey);
    try {
      const req = await EXM.deterministicFetch(
        `${state.molecule_endpoints.ar_ota}/${decryptedPubKey}`,
      );
      const address = req.asJSON().address;
      _validateArweaveAddress(address);
      return address;
    } catch (error) {
      throw new ContractError("ERROR_OTA_MOLECULE_SERVER_ERROR");
    }
  }

  function _validateArweaveAddress(address) {
    ContractAssert(
      /[a-z0-9_-]{43}/i.test(address),
      "ERROR_INVALID_ARWEAVE_ADDRESS",
    );
  }

  function _validatePubKeySyntax(jwk_n) {
    ContractAssert(typeof jwk_n === "string", "ERROR_INVALID_JWK_N_SYNTAX");
  }
}
