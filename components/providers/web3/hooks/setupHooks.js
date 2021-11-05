import { handler as createAccountHook } from "./useAccount";
import { handler as createNetworkHook } from "./useNetwork";

// const DEFAULT_HOOKS = {
//     useAccount: () => ({account: null})
// }

export const setupHooks = (web3, provider) => {
    // if(!web3) { return DEFAULT_HOOKS }

    return {
        useAccount: createAccountHook(web3, provider),
        useNetwork: createNetworkHook(web3, provider)
    }
}