import { useState, useEffect } from "react";
import useSWR from 'swr';

const adminAddresses = {
    "0x7426226ffe7212bf07f882a1e1602e2c51ab635a825560464865c6db0e3f618e": true
}

export const handler = (web3, provider) => () => {
    // const [account, setAccount] = useState();

    const { data, mutate, ...rest } = useSWR(() => 
        web3 ? 'web3/accounts' : null,
        async() => {
            const accounts = await web3.eth.getAccounts();
            return accounts[0];
        }
    )

    // useEffect(() => {
    //     const getAccount = async () => {
    //         const accounts = await web3.eth.getAccounts();
    //         setAccount(accounts[0]);
    //     }

    //     web3 && getAccount()
    // },[web3])

    useEffect(() => {
        provider &&
        provider.on("accountsChanged", 
        accounts => mutate(accounts[0]) ?? null)
    }, [provider])

    return {
            data,
            isAdmin: (data && adminAddresses[web3.utils.keccak256(data)]) ?? false,
            mutate, 
            ...rest
        }
}