import { useEffect } from "react";
import { useHooks } from "@components/providers/web3";
import { useRouter } from "next/dist/client/router";
import { useWeb3 } from "@components/providers";

const _isEmpty = (data) => {
    return(
        data == null ||
        data === "" ||
        (Array.isArray(data) && data.length === 0) ||
        (data.constructor === Object && Object.keys(data).length === 0)
    )
}

const enhanceHooks = swrResponse => {
    const { data, error } = swrResponse; 
    const hasInitialResponse = !!(data || error)
    const isEmpty = hasInitialResponse && _isEmpty(data)

    return {
        ...swrResponse,
        isEmpty,
        hasInitialResponse
    }
}

export const useAccount = () => {
    const swrResponse = enhanceHooks(useHooks(hooks => hooks.useAccount)());
    return {
        account: swrResponse
    }
}

export const useAdmin = ({redirectTo}) => {
    const { account } = useAccount();
    const { requireInstall } = useWeb3();
    const router = useRouter();

    useEffect(() => {
        if((
            requireInstall ||
            account.hasInitialResponse &&
            !account.isAdmin) ||
            account.isEmpty) {
                router.push(redirectTo);
            }
    }, [account]);

    return { account }
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

    const isConnecting = 
        !account.hasInitialResponse && !network.hasInitialResponse;

    return {
        account,
        network,
        isConnecting,
        hasConnectedWallet: !!(account.data && network.isSupported)
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

export const useManagedCourses = (...args ) => {
    const swrRes = enhanceHooks(useHooks(hooks => hooks.useManagedCourses)(...args));

    return {
        managedCourses: swrRes
    }
}