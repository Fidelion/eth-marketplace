import useSWR from "swr"
import { normalize } from "@utils/normalizeCourse";
import { createCourseHash } from "@utils/hash";

export const handler = (web3, contract) => (courses, account) => {
    const swrRes = useSWR(() => 
        (web3 && contract && account) ? `web3/ownedCourses/${account}` : null,
        async () => {
            const ownedCourses = [];

            for(let i = 0; i < courses.length; i++) {
                const course = courses[i];

                if(!course.id) { continue };
                
                const courseHash = createCourseHash(web3)(course.id, account);

                const ownedCourse = await contract.methods.getCourseAtHash(courseHash).call();
                if(ownedCourse.owner !== "0x0000000000000000000000000000000000000000") {
                    const normalizedCourse = normalize(web3)(course, ownedCourse);
                    ownedCourses.push(normalizedCourse);
                }
            }
            
            return ownedCourses;
        }

    )

    return swrRes
}