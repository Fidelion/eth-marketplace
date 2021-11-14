import { useWalletInfo } from "@components/hooks/web3";
import { CourseCard, CourseList } from "@components/ui/course";
import { BaseLayout } from "@components/ui/layout";
import { getAllCourses } from "@content/courses/fetcher";
import { Button } from "@components/ui/common";
import { OrderModal } from "@components/ui/order";
import { useState } from "react";
import { MarketHeader } from "@components/ui/marketplace";
import { useWeb3 } from "@components/providers";

function Marketplace({ courses }) {
  const[selectedCourse, setSelectedCourse] = useState(null);

  const { web3, contract } = useWeb3();
  const { canPurchase, account } = useWalletInfo();

  const purchaseCourse = async order => {
    const hexCourseId = web3.utils.utf8ToHex(selectedCourse.id);
    console.log(hexCourseId);

    const courseHash = web3.utils.soliditySha3(
      { type: "bytes16", value: hexCourseId },
      { type: "address", value: account.data}
    );
    console.log(courseHash);

    const emailHash = web3.utils.sha3(order.email);

    console.log(emailHash);

    const proof = web3.utils.soliditySha3(
      { type: "bytes32", value: emailHash},
      { type: "bytes32", value: courseHash }
    )

    const price = web3.utils.toWei(String(order.price));
    try {
      const result = await contract.methods.purchaseCourse(
        hexCourseId,
        proof
      ).send({from: account.data, price});
      console.log(result);
    } catch {
      console.error("Purchase course error. Purchase has failed to process.");
    } 
  }

  return (
    <>
            <MarketHeader />
            <CourseList courses={courses}>
             { course => <CourseCard 
                        key={course.id} 
                        course={course}
                        disabled={!canPurchase}
                        Footer={() => 
                            <div className="mt-4">
                               <Button
                               disabled={!canPurchase} 
                               variant="lightPurple"
                               onClick={() => setSelectedCourse(course)}>
                                    Purchase
                               </Button>
                            </div>
                        } 
                      />
                    } 
            </CourseList>
            {selectedCourse && 
          <OrderModal 
            onSubmit={purchaseCourse}
            course={selectedCourse}
            onClose={() => setSelectedCourse(null)} />}
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