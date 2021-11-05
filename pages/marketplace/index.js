import { useAccount } from "@components/hooks/web3/useAccount";
import { useNetwork } from "@components/hooks/web3/useNetwork";
import { CourseCard, CourseList } from "@components/ui/course";
import { BaseLayout } from "@components/ui/layout";
import { Wallet } from "@components/ui/web3";
import { getAllCourses } from "@content/courses/fetcher";

function Home({ courses }) {
  const { account } = useAccount();
  const { network } = useNetwork();
  return (
    <>
        <div className="py-4">
            <Wallet address={account.data} 
                    network={[{
                        data: network.data,
                        isSupported: network.isSupported,
                        target: network.target
                    }]} />
            
            <CourseList courses={courses}>
             { course => <CourseCard key={course.id} course={course} />} 
            </CourseList>
        </div>
    </>
  );
}

const Wrapper = ({...props}) => 
  <BaseLayout>
    <Home {...props}/>
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