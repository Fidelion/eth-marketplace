import { useHooks } from "@components/providers/web3";

const enhanceHooks = swrResponse => {
    return {
        ...swrResponse,
        hasFinishedFirstFetch: swrResponse.data || swrResponse.error
    }
}

export const useAccount = () => {
    const swrResponse = enhanceHooks(useHooks(hooks => hooks.useAccount)());
    return {
        account: swrResponse
    }
}

export const useNetwork = () => {
    const swrResponse = enhanceHooks(useHooks(hooks => hooks.useNetwork)());
    return {
        network: swrResponse
    }
}

export const useWalletInfo = () => {
    const { account } = useAccount();
    const { network } = useNetwork();

    return {
        account,
        network,
        canPurchase: !!(account.data && network.isSupported)
    }
}

export const useOwnedCourses = (...args ) => {
    const swrRes = enhanceHooks(useHooks(hooks => hooks.useOwnedCourses)(...args));

    return {
        ownedCourses: swrRes
    }
}

export const useOwnedCourse = (...args ) => {
    const swrRes = enhanceHooks(useHooks(hooks => hooks.useOwnedCourse)(...args));

    return {
        ownedCourse: swrRes
    }
}