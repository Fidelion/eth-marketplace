import { useAdmin, useManagedCourses } from "@components/hooks/web3";
import { useWeb3 } from "@components/providers";
import { Button, Message } from "@components/ui/common";
import { ManagedCourseCard } from "@components/ui/course";
import CourseFilter from "@components/ui/course/filter";
import { BaseLayout } from "@components/ui/layout";
import { MarketHeader } from "@components/ui/marketplace";
import { useState } from "react";

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
    const { web3, contract } = useWeb3();
    const { account } = useAdmin({redirectTo: "/marketplace"});
    const { managedCourses } = useManagedCourses(account);

    const verifyCourse = (email, {courseHash, proof}) => {
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

    const activateCourse = async courseHash => {
        try {
            await contract.methods.activateCourse(courseHash).send({
                from: account.data
            })
        } catch (error) {
            console.error(error);
        }
    }

    if(!account.isAdmin) {
        return null
    }

    return (
        <>
            <MarketHeader />
            <CourseFilter />
                <section className="grid grid-cols-1">
                {
                    managedCourses.data?.map( course => 
                        <ManagedCourseCard 
                            key={course.ownedCourseId}
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
                                    variant="red">
                                        Deactivate
                                    </Button>
                                </div>
                            }

                        </ManagedCourseCard>    
                    )
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