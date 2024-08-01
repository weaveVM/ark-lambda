export async function handle(state, action) {
    const input = action.input;
  
    if (input.function === "linkArweaveAddress") {
      const caller = lambda.msg.sender.toLowerCase();
      const { arweave_owner, arweave_sig } = input;
  
      await _verifyArSignature(arweave_owner, arweave_sig, caller);
      const arweave_address = await _ownerToAddress(arweave_owner);
  
      if (!(caller in state.arks)) {
        state.arks[caller] = [];
      }
  
      ContractAssert(
        !state.arks[caller].includes(arweave_address),
        "ERROR_AR_ADDRESS_ADDED",
      );
  
      state.arks[caller].push(arweave_address);
      return { state };
    }
  
    async function _verifyArSignature(owner, signature, evm_caller) {
      try {
        const decryptedOwner = atob(owner);
        _validatePubKeySyntax(owner);
  
        const sigBody = state.sig_messages;
  
        const encodedMessage = btoa(
          `${sigBody[sigBody.length - 1]}::${decryptedOwner}::${evm_caller}`,
        );
  
        const isValid = (
          await EXM.deterministicFetch(
            `${state.molecule_endpoints.ar_mem}/${owner}/${encodedMessage}/${signature}`,
          )
        )?.asJSON()?.result;
  
        ContractAssert(isValid, "ERROR_INVALID_CALLER_SIGNATURE");
        ContractAssert(
          !state.signatures.includes(signature),
          "ERROR_SIGNATURE_ALREADY_USED",
        );
        state.signatures.push(signature);
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
        const address = req.asJSON()?.address;
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
  