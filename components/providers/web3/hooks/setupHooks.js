import { handler as createAccountHook } from "./useAccount";
import { handler as createNetworkHook } from "./useNetwork";
import { handler as createOwnedCoursesHook } from "./useOwnedCourses";
import { handler as createOwnedCourseHook } from "./useOwnedCourse"; 
import { handler as createManagedCoursesHook } from "./useManagedCourses"; 

// const DEFAULT_HOOKS = {
//     useAccount: () => ({account: null})
// }

export const setupHooks = ({web3, provider, contract}) => {
    // if(!web3) { return DEFAULT_HOOKS }
    console.log("Setting up hooks!!!")
    return {
        useAccount: createAccountHook(web3, provider),
        useNetwork: createNetworkHook(web3, provider),
        useOwnedCourses: createOwnedCoursesHook(web3, contract),
        useOwnedCourse: createOwnedCourseHook(web3, contract),
        useManagedCourses: createManagedCoursesHook(web3, contract)
    }
}