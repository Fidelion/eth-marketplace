import { createCourseHash } from "@utils/hash";
import useSWR from "swr"
import { normalize } from "@utils/normalizeCourse";

export const handler = (web3, contract) => (course, account) => {
    const swrRes = useSWR(() => 
        (web3 && contract && account) ? `web3/ownedCourse/${account}` : null,
        async () => {
            const courseHash = createCourseHash(web3)(course.id, account)

            const ownedCourse = await contract.methods.getCourseAtHash(courseHash).call();
            if(ownedCourse.owner === "0x0000000000000000000000000000000000000000") {
                return null;
            }
            
            return normalize(web3)(course,ownedCourse);
        }

    )

    return swrRes
}