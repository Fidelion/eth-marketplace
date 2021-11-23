import { createCourseHash } from "@utils/hash";
import useSWR from "swr"
import { normalize } from "@utils/normalizeCourse";

export const handler = (web3, contract) => account => {
    const swrRes = useSWR(() => 
        (web3 && 
        contract && account.isAdmin && account.data) ? `web3/managedCourses/${account.data}` : null,
        async () => {
            const courses = [];
            const courseCount = await contract.methods.getTotalCourses().call();

            //Get the newest owned courses
            for(let i = Number(courseCount) - 1; i >= 0; i--) {
                const courseHash = await contract.methods.getCourseAtIndex(i).call();
                const course = await contract.methods.getCourseAtHash(courseHash).call();
                
                if(course) {
                    const normalized = normalize(web3)({ hash: courseHash }, course);
                    courses.push(normalized);
                }
            }
        return courses;
        }
    )

    return swrRes;
}