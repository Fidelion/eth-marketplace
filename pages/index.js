import { useWeb3 } from "@components/providers";
import { Breadcrumbs, Footer, Hero, Navbar } from "@components/ui/common";
import { CourseList } from "@components/ui/course";
import { BaseLayout } from "@components/ui/layout";
import { getAllCourses } from "@content/courses/fetcher";

function Home({ courses }) {
  const { web3, isLoading } = useWeb3();
  console.log(web3);
  return (
    <>
            <Hero />
            <CourseList courses={courses} />
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