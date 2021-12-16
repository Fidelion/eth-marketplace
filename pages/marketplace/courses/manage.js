import { useAdmin, useManagedCourses } from "@components/hooks/web3";
import { useWeb3 } from "@components/providers";
import { Button, Message } from "@components/ui/common";
import { ManagedCourseCard } from "@components/ui/course";
import CourseFilter from "@components/ui/course/filter";
import { BaseLayout } from "@components/ui/layout";
import { MarketHeader } from "@components/ui/marketplace";
import { normalize } from "@utils/normalizeCourse";
import { useEffect, useState } from "react";

const VerificationInput = ({onVerify}) => {
    const [email, setEmail] = useState("");

    return (
        <div className="flex mr-2 relative rounded-md">
            <input 
                type="text"
                value={email}
                onChange={({target: {value}}) => setEmail(value)}
                name="account"
                id="account"
                className="w-96 focus:ring-indigo-500 shadow-md focus:border-indigo-500 block pl-7 p-4 sm:text-sm border-gray-300 rounded-md" 
                placeholder="0x2341ab..." />
                <Button 
                    onClick={() => {
                        onVerify(email)
                    }}
                    >
                    Verify
                </Button>
        </div>
    )
}

function ManageCourses() {
    const [provedOwnership, setProvedOwnership] = useState({});
    const [searchedCourse, setSearchedCourse] = useState(null);
    const [filters, setFilters] = useState({state: "all"});
    const { web3, contract } = useWeb3();
    const { account } = useAdmin({redirectTo: "/marketplace"});
    const { managedCourses } = useManagedCourses(account);

    const verifyCourse = (email, {courseHash, proof}) => {
        if(!email) {
            return
        }
        
        const emailHash = web3.utils.sha3(email);
        const proofToCheck = web3.utils.soliditySha3(
            { type: "bytes32", value: emailHash },
            { type: "bytes32", value: courseHash }
        )

        proofToCheck === proof ?
            setProvedOwnership({
                [courseHash]: true
            }) : 
            setProvedOwnership({
                [courseHash]: false
            })
    }

    const changeCourseState = async (courseHash, method) => {
        try {
            await contract.methods[method](courseHash).send({
                from: account.data
            })
        } catch (error) {
            console.error(error);
        }
    }

    const activateCourse = async courseHash => {
        changeCourseState(courseHash, "activateCourse");
    }

    const deactivateCourse = async courseHash => {
       changeCourseState(courseHash, "deactivateCourse");
    }

    const searchCourse = async hash => {
        const re = /[0-9A-Fa-f]{6}/g;

        if(hash && hash.length === 66 && re.test(hash)) {
            const course = await contract.methods.getCourseAtHash(hash).call();

            if(course.owner !== "0x0000000000000000000000000000000000000000") {
                const normalized = normalize(web3)({hash}, course);
                setSearchedCourse(normalized);
                return
            }
        }

        setSearchedCourse(null);
    }

    const renderCard = (course, isSearched) => {
        return (
            <ManagedCourseCard 
                key={course.ownedCourseId}
                isSearched={isSearched}
                course={course}
            >
                <VerificationInput onVerify={email => {
                    verifyCourse(email, {
                        courseHash: course.hash, 
                        proof: course.proof
                    })
                }} />
                {
                    provedOwnership[course.hash] &&
                    <div className="mt-2">
                        <Message>
                            Verified!
                        </Message>
                    </div>
                }
                {
                    provedOwnership[course.hash] === false &&
                    <div className="mt-2">
                        <Message type="danger">
                            Wrong Proof!
                        </Message>
                    </div>
                }
                {
                    <div className="mt-2">
                        <Button 
                        onClick={() => activateCourse(course.hash)}
                        variant="green">
                            Activate
                        </Button>
                        <Button
                        onClick={() => deactivateCourse(course.hash)}
                        variant="red">
                            Deactivate
                        </Button>
                    </div>
                }

            </ManagedCourseCard>
        );
    }

    if(!account.isAdmin) {
        return null
    }

    const filteredCourse = managedCourses.data?.filter((course) => {
            if(filters.state === "all") {
                return true;
            }

            return course.state === filters.state;
        }).map( course => renderCard(course));

    return (
        <>
            <MarketHeader />
            <CourseFilter
                onFilterSelect={(value) => setFilters({state: value})} 
                onSearchSubmit={searchCourse} />
                <section className="grid grid-cols-1">
                { searchedCourse &&
                    <div>
                        <h1 className="text-2xl font-bold p-5">Search</h1>
                        { renderCard(searchedCourse, true) }
                    </div>
                }
                    <h1 className="text-2xl font-bold p-5">All Courses</h1>
                    { filteredCourse }
                    { filteredCourse?.length === 0 &&
                        <Message type="warning">
                            No courses to display
                        </Message>
                    }
                </section>
        </>
    )
}

const Wrapper = ({...props}) => 
    <BaseLayout>
       <ManageCourses {...props} />
    </BaseLayout>


export default Wrapper;