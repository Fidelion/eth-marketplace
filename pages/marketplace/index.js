import { useOwnedCourses, useWalletInfo } from "@components/hooks/web3";
import { CourseCard, CourseList } from "@components/ui/course";
import { BaseLayout } from "@components/ui/layout";
import { getAllCourses } from "@content/courses/fetcher";
import { Button, Loader, Message } from "@components/ui/common";
import { OrderModal } from "@components/ui/order";
import { useState } from "react";
import { MarketHeader } from "@components/ui/marketplace";
import { useWeb3 } from "@components/providers";

function Marketplace({ courses }) {
  const[selectedCourse, setSelectedCourse] = useState(null);
  const[isNewPurchase, setIsNewPurchase] = useState(true);

  const { web3, contract, requireInstall } = useWeb3();
  const { hasConnectedWallet, isConnecting, account } = useWalletInfo();
  const { ownedCourses } = useOwnedCourses(courses, account.data);

  const purchaseCourse = async order => {
    const hexCourseId = web3.utils.utf8ToHex(selectedCourse.id);
    console.log(hexCourseId);

    const courseHash = web3.utils.soliditySha3(
      { type: "bytes16", value: hexCourseId },
      { type: "address", value: account.data}
    );

    const price = web3.utils.toWei(String(order.price));

    if(isNewPurchase) {
      const emailHash = web3.utils.sha3(order.email);
      const proof = web3.utils.soliditySha3(
      { type: "bytes32", value: emailHash},
      { type: "bytes32", value: courseHash }
    );
      _purchaseCourse(hexCourseId, proof, price);
    } else {
      _repurchaseCourse(courseHash, price);
    }
  }

  const _purchaseCourse = async(hexCourseId, proof, price) => {
    try {
      const result = await contract.methods.purchaseCourse(
        hexCourseId,
        proof
      ).send({from: account.data, price})
      console.log(result);
    } catch {
        console.error("Purchase course: Operation has failed.");
    }
  }

  const _repurchaseCourse = async(courseHash, price) => {
    try {
      const result = await contract.methods.repurchaseCourse(
        courseHash
      ).send({from: account.data, price})
      console.log(result);
    } catch {
        console.error("Repurchase course: Operation has failed.");
    }
  }

  return (
    <>
            <MarketHeader />
            <CourseList courses={courses}>
             { course => {
                const owned = ownedCourses.lookup[course.id];
                return (
                  <CourseCard 
                        key={course.id} 
                        course={course}
                        state={owned?.state}
                        disabled={!hasConnectedWallet}
                        Footer={() => {
                            
                            if(requireInstall) {
                              return (
                                <Button
                                  size="md"
                                  disabled={true}
                                  variant="lightPurple">
                                  Install
                                </Button>
                              )
                            }

                            if(isConnecting) {
                              return (
                                <Button
                                  size="md"
                                  disabled={true}
                                  variant="lightPurple">
                                  <Loader size="sm" />
                                </Button>
                              )
                            }
                            
                            if(!ownedCourses.hasInitialResponse) {
                              <div style={{height: "42px"}}></div>
                            }

                            if(owned) {
                              return (
                                <>

                                <div className="flex">
                                <Button
                                    size="md"
                                    onClick={() => alert("You own this course.")}
                                    disabled={false} 
                                    variant="white">
                                      Owned &#10004;
                                </Button>
                                {
                                  owned.state === "deactivated" &&
                                  <div className="ml-1">
                                  <Button
                                    size="md"
                                    disabled={false}
                                    onClick={() => {
                                      setIsNewPurchase(false);
                                      setSelectedCourse(course)
                                    }} 
                                    variant="purple">
                                      Fund to Activate
                                  </Button>
                                  </div>
                                }
                                </div>
                                <div className="mt-1">
                                </div>
                                </>
                              )
                            }

                            return(
                               <Button
                               size="md"
                               disabled={!hasConnectedWallet} 
                               variant="lightPurple"
                               onClick={() => setSelectedCourse(course)}>
                                    Purchase
                               </Button>
                            )}
                        } 
                      />
                            )}
                    } 
            </CourseList>
            {selectedCourse && 
          <OrderModal 
            onSubmit={purchaseCourse}
            isNewPurchase={isNewPurchase}
            course={selectedCourse}
            onClose={() => {
              setSelectedCourse(null);
              setIsNewPurchase(true);
            }} />}
    </>
  );
}

const Wrapper = ({...props}) => 
  <BaseLayout>
    <Marketplace {...props}/>
  </BaseLayout>

export default Wrapper;

export function getStaticProps() {
  const { data } = getAllCourses();

  return {
    props: {
      courses: data
    }
  }
}