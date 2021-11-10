import { useWalletInfo } from "@components/hooks/web3";
import { CourseCard, CourseList } from "@components/ui/course";
import { BaseLayout } from "@components/ui/layout";
import { EthRates, Wallet } from "@components/ui/web3";
import { getAllCourses } from "@content/courses/fetcher";
import { Breadcrumbs, Button } from "@components/ui/common";
import { OrderModal } from "@components/ui/order";
import { useState } from "react";
import { MarketHeader } from "@components/ui/marketplace";

function Marketplace({ courses }) {
  const[selectedCourse, setSelectedCourse] = useState(null);

  const { canPurchase } = useWalletInfo();

  const purchaseCourse = (order) => {
    alert(JSON.stringify(order))
  }

  return (
    <>
        <div className="py-4">
            <MarketHeader />
        </div>
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