import { useState, useEffect } from "react";
import useSWR from 'swr';

const adminAddresses = {
    "0x7426226ffe7212bf07f882a1e1602e2c51ab635a825560464865c6db0e3f618e": true
    // "0xf4d7f76e8b89576eb820ef09899f329cb5febd2513fc695609f0ae9d1c14c805": true
}

export const handler = (web3, provider) => () => {
    // const [account, setAccount] = useState();

    const { data, mutate, ...rest } = useSWR(() => 
        web3 ? 'web3/accounts' : null,
        async() => {
            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];
            
            if(!account) {
                throw new Error("Cannot retrieve an account. Please refresh your browser.")
            }
            return account;
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
        const mutator = accounts => mutate(accounts[0] ?? null)
        provider?.on("accountsChanged", mutator)
        
        return () => {
            provider?.removeListener("accountsChanged", mutator)
        }
    }, [provider])

    return {
            data,
            isAdmin: (data && adminAddresses[web3.utils.keccak256(data)]) ?? false,
            mutate, 
            ...rest
        }
}