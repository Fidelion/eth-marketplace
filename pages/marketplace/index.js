import { useOwnedCourses, useWalletInfo } from "@components/hooks/web3";
import { CourseCard, CourseList } from "@components/ui/course";
import { BaseLayout } from "@components/ui/layout";
import { getAllCourses } from "@content/courses/fetcher";
import { Button, Loader, Message } from "@components/ui/common";
import { OrderModal } from "@components/ui/order";
import { useState } from "react";
import { MarketHeader } from "@components/ui/marketplace";
import { useWeb3 } from "@components/providers";
import { withToast } from "@utils/toast";

function Marketplace({ courses }) {
  const[selectedCourse, setSelectedCourse] = useState(null);
  const[isNewPurchase, setIsNewPurchase] = useState(true);
  const[busyCourseId, setBusyCourseId] = useState(null);

  const { web3, contract, requireInstall } = useWeb3();
  const { hasConnectedWallet, isConnecting, account } = useWalletInfo();
  const { ownedCourses } = useOwnedCourses(courses, account.data);

  const purchaseCourse = async (order, course) => {
    const hexCourseId = web3.utils.utf8ToHex(course.id);

    const courseHash = web3.utils.soliditySha3(
      { type: "bytes16", value: hexCourseId },
      { type: "address", value: account.data}
    );

    const price = web3.utils.toWei(String(order.price));

    setBusyCourseId(course.id);
    if(isNewPurchase) {
      const emailHash = web3.utils.sha3(order.email);
      const proof = web3.utils.soliditySha3(
      { type: "bytes32", value: emailHash},
      { type: "bytes32", value: courseHash }
    );
      withToast(_purchaseCourse({hexCourseId, proof, price}), course);
    } else {
      withToast(_repurchaseCourse({courseHash, price}, course));
    }
  }

  const _purchaseCourse = async({hexCourseId, proof, price}, course) => {
    try {
      const result = await contract.methods.purchaseCourse(
        hexCourseId,
        proof
      ).send({from: account.data, price});

      ownedCourses.mutate([
        ...ownedCourses.data, {
          ...course,
          proof,
          state: "purchased",
          owner: account.data,
          price
        }
      ])
      
      return result;
    } catch(error) {
        throw new Error(error.message);
    } finally {
      setBusyCourseId(null);
    }
  }

  const _repurchaseCourse = async({courseHash, price}, course) => {
    try {
      const result = await contract.methods.repurchaseCourse(
        courseHash
      ).send({from: account.data, price});

      const index = ownedCourses.data.findIndex(c => c.id === course.id);
      
      if(index >= 0) {
        ownedCourses.data[index].state = "purchased";
        ownedCourses.mutate(ownedCourses.data);
      } else {
        ownedCourses.mutate();
      }

      return result;
    } catch {
        throw new Error(error.message);
    } finally {
      setBusyCourseId(null);
    }
  }

  const notify = () => {
    const resolveWithSomeData = new Promise(resolve => setTimeout(() => resolve({
      transactionHash: "0x610ebf769141514a711bb9ef01c09340f14fe28c3709a3c12c0c05dd5e7c668a"
    }), 3000));
    withToast(resolveWithSomeData);
  }

  const cleanupModal = () => {
    setSelectedCourse(null);
    setIsNewPurchase(true);
  }
  return (
    <>
            <MarketHeader />
            <Button onClick={notify}> 
              Notify
            </Button>
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
                              return (
                                <Button
                                variant="white"
                                disabled={true}
                                size="sm">
                                Loading State...
                              </Button>
                              )
                            }

                            const isBusy = busyCourseId === course.id;

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
                                      setSelectedCourse(course);
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
                               disabled={!hasConnectedWallet || isBusy} 
                               variant="lightPurple"
                               onClick={() => setSelectedCourse(course)}>
                                { isBusy ?
                                    <div className="flex">
                                        <Loader size="sm" />
                                        <div className="ml-2">In Progress</div>
                                    </div> :
                                    <div>Purchase</div>
                                }
                               </Button>
                            )}
                        } 
                      />
                            )}
                    } 
            </CourseList>
            {selectedCourse && 
          <OrderModal 
            course={selectedCourse}
            isNewPurchase={isNewPurchase}
            onSubmit={(formData, course) => {
              purchaseCourse(formData, course);
              cleanupModal();
            }}
            onClose={cleanupModal} />}
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